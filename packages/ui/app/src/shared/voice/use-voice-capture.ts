import { useAppSettings, useTranscribeAudio } from '@two-pebble/realtime';
import { useEffect, useRef, useState } from 'react';

export type VoiceCaptureStatus = 'idle' | 'recording' | 'transcribing' | 'error';

type VoiceTranscriptHandler = (text: string) => void;
type VoiceCaptureClickHandler = () => void;
type AudioAnalyser = AnalyserNode | null;
type AudioContextMaybe = AudioContext | null;
type BrowserWindowWithWebkitAudio = Window & {
  AudioContext: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
};

interface UseVoiceCaptureInput {
  onTranscript: VoiceTranscriptHandler;
  onSubmitTranscript?: VoiceTranscriptHandler;
}

interface UseVoiceCaptureResult {
  analyser: AudioAnalyser;
  disabled: boolean;
  disabledReason: string;
  errorMessage: string;
  onClick: VoiceCaptureClickHandler;
  onSubmitClick: VoiceCaptureClickHandler;
  canSubmit: boolean;
  status: VoiceCaptureStatus;
}

export function useVoiceCapture(input: UseVoiceCaptureInput): UseVoiceCaptureResult {
  const appSettings = useAppSettings();
  const transcribeAudio = useTranscribeAudio();
  const recorderRef = useRef<RecorderOrNull>(null);
  const audioContextRef = useRef<AudioContextMaybe>(null);
  const chunksRef = useRef<Blob[]>([]);
  const submitAfterRef = useRef(false);
  const [status, setStatus] = useState<VoiceCaptureStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  useEffect(() => {
    return () => {
      stopRecorderTracks(recorderRef.current);
      teardownAudioContext(audioContextRef.current);
    };
  }, []);

  const profileId = appSettings.value?.defaultTranscriptionProfileId ?? null;
  const supported = isMediaRecorderSupported();
  const disabled = !supported || profileId === null || status === 'transcribing' || appSettings.status === 'loading';
  const disabledReason = !supported
    ? 'Audio recording is not supported in this browser.'
    : profileId === null
      ? 'Set a default transcription profile in Speech settings to enable voice input.'
      : '';

  const startRecording = async () => {
    if (profileId === null) return;
    setErrorMessage('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickRecorderMimeType();
      const recorder = mimeType === undefined ? new MediaRecorder(stream) : new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      });
      recorder.addEventListener('stop', () => {
        void finalizeRecording(recorder.mimeType, profileId);
      });
      recorderRef.current = recorder;
      const analyserNode = setupAnalyser(stream);
      if (analyserNode !== null) {
        setAnalyser(analyserNode);
      }
      recorder.start();
      setStatus('recording');
    } catch (error) {
      teardownAudioContext(audioContextRef.current);
      audioContextRef.current = null;
      setAnalyser(null);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Could not start recording.');
    }
  };

  const setupAnalyser = (stream: MediaStream): AudioAnalyser => {
    const browserWindow = window as BrowserWindowWithWebkitAudio;
    const AudioContextCtor = browserWindow.AudioContext ?? browserWindow.webkitAudioContext;
    if (typeof AudioContextCtor !== 'function') return null;
    const audioContext = new AudioContextCtor();
    const source = audioContext.createMediaStreamSource(stream);
    const analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 128;
    analyserNode.smoothingTimeConstant = 0.6;
    source.connect(analyserNode);
    audioContextRef.current = audioContext;
    return analyserNode;
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (recorder === null) return;
    setStatus('transcribing');
    setAnalyser(null);
    teardownAudioContext(audioContextRef.current);
    audioContextRef.current = null;
    recorder.stop();
  };

  const finalizeRecording = async (recorderMimeType: string, transcriptionProfileId: string) => {
    const recorder = recorderRef.current;
    stopRecorderTracks(recorder);
    recorderRef.current = null;
    const shouldSubmit = submitAfterRef.current;
    submitAfterRef.current = false;
    const blob = new Blob(chunksRef.current, { type: recorderMimeType || 'audio/webm' });
    chunksRef.current = [];
    if (blob.size === 0) {
      setStatus('idle');
      return;
    }
    try {
      const base64Data = await blobToBase64(blob);
      const result = await transcribeAudio({
        inferenceProfileId: transcriptionProfileId,
        base64Data,
        mimeType: blob.type.length > 0 ? blob.type : 'audio/webm',
      });
      if (shouldSubmit && input.onSubmitTranscript !== undefined) {
        input.onSubmitTranscript(result.text);
      } else {
        input.onTranscript(result.text);
      }
      setStatus('idle');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Transcription failed.');
    }
  };

  const onClick = () => {
    if (status === 'recording') {
      submitAfterRef.current = false;
      stopRecording();
      return;
    }
    if (status === 'error') {
      setStatus('idle');
      setErrorMessage('');
      return;
    }
    void startRecording();
  };

  const onSubmitClick = () => {
    if (status === 'recording') {
      submitAfterRef.current = true;
      stopRecording();
      return;
    }
    // Outside of recording the submit affordance is hidden, but keep the hook consistent.
    onClick();
  };

  return {
    analyser,
    canSubmit: input.onSubmitTranscript !== undefined,
    disabled,
    disabledReason,
    errorMessage,
    onClick,
    onSubmitClick,
    status,
  };
}

function isMediaRecorderSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.MediaRecorder !== 'undefined';
}

function pickRecorderMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
  for (const candidate of candidates) {
    if (MediaRecorder.isTypeSupported(candidate)) {
      return candidate;
    }
  }
  return undefined;
}

type RecorderOrNull = MediaRecorder | null;

function stopRecorderTracks(recorder: RecorderOrNull) {
  if (recorder === null) return;
  for (const track of recorder.stream.getTracks()) {
    track.stop();
  }
}

function teardownAudioContext(context: AudioContextMaybe) {
  if (context === null) return;
  if (context.state !== 'closed') {
    void context.close().catch(() => undefined);
  }
}

type Base64Promise = Promise<string>;

function blobToBase64(blob: Blob): Base64Promise {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('error', () => reject(reader.error ?? new Error('FileReader failed')));
    reader.addEventListener('loadend', () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const commaIndex = result.indexOf(',');
      resolve(commaIndex === -1 ? result : result.slice(commaIndex + 1));
    });
    reader.readAsDataURL(blob);
  });
}
