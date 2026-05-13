'use client';

import { useAppSettings, useGenerateSpeech } from '@two-pebble/realtime';
import { useCallback, useEffect, useRef, useState } from 'react';

export type SpeakTextState = 'idle' | 'loading' | 'playing';

export interface SpeakTextController {
  state: SpeakTextState;
  activeText: string | null;
  available: boolean;
  error: string;
  start: (text: string) => void;
  stop: () => void;
}

interface SpeechPlaybackContext {
  isCurrent: () => boolean;
  releaseAudio: () => void;
  setActiveText: (text: string | null) => void;
  setError: (error: string) => void;
  setState: (state: SpeakTextState) => void;
}

export function useSpeakText(): SpeakTextController {
  const appSettings = useAppSettings();
  const generateSpeech = useGenerateSpeech();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastUrlRef = useRef<string | null>(null);
  const requestSeqRef = useRef(0);
  const [state, setState] = useState<SpeakTextState>('idle');
  const [activeText, setActiveText] = useState<string | null>(null);
  const [error, setError] = useState('');

  const releaseAudio = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (lastUrlRef.current !== null) {
      URL.revokeObjectURL(lastUrlRef.current);
      lastUrlRef.current = null;
    }
  }, []);

  useEffect(() => releaseAudio, [releaseAudio]);

  const profileId = appSettings.value?.defaultSpeechProfileId ?? null;
  const available = profileId !== null;

  const stop = useCallback(() => {
    requestSeqRef.current += 1;
    releaseAudio();
    setState('idle');
    setActiveText(null);
  }, [releaseAudio]);

  const start = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (trimmed.length === 0 || profileId === null) {
        return;
      }
      const seq = ++requestSeqRef.current;
      releaseAudio();
      setError('');
      setState('loading');
      setActiveText(trimmed);
      const playbackContext: SpeechPlaybackContext = {
        isCurrent: () => requestSeqRef.current === seq,
        releaseAudio,
        setActiveText,
        setError,
        setState,
      };
      void (async () => {
        try {
          const result = await generateSpeech({ inferenceProfileId: profileId, text: trimmed });
          if (requestSeqRef.current !== seq) {
            return;
          }
          const blob = base64ToBlob(result.base64Data, result.mimeType || 'audio/mpeg');
          const url = URL.createObjectURL(blob);
          lastUrlRef.current = url;
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.addEventListener('ended', () => {
            finishSpeechPlayback(playbackContext);
          });
          audio.addEventListener('error', () => {
            failSpeechPlayback(playbackContext, 'Audio playback failed.');
          });
          setState('playing');
          await audio.play();
        } catch (failure) {
          if (requestSeqRef.current !== seq) {
            return;
          }
          releaseAudio();
          setState('idle');
          setActiveText(null);
          setError(failure instanceof Error ? failure.message : 'Speech playback failed.');
        }
      })();
    },
    [generateSpeech, profileId, releaseAudio],
  );

  return { state, activeText, available, error, start, stop };
}

function finishSpeechPlayback(context: SpeechPlaybackContext): void {
  if (!context.isCurrent()) {
    return;
  }
  resetSpeechPlayback(context);
}

function failSpeechPlayback(context: SpeechPlaybackContext, error: string): void {
  if (!context.isCurrent()) {
    return;
  }
  resetSpeechPlayback(context);
  context.setError(error);
}

function resetSpeechPlayback(context: SpeechPlaybackContext): void {
  context.releaseAudio();
  context.setState('idle');
  context.setActiveText(null);
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}
