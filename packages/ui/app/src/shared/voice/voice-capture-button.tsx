import { Icon, IconButton } from '@two-pebble/components';
import { useVoiceCapture, type VoiceCaptureStatus } from './use-voice-capture';
import { VoiceWaveform } from './voice-waveform';

interface VoiceCaptureButtonProps {
  onTranscript: (text: string) => void;
  onSubmitTranscript?: (text: string) => void;
}

export function VoiceCaptureButton(props: VoiceCaptureButtonProps) {
  const capture = useVoiceCapture({
    onTranscript: props.onTranscript,
    ...(props.onSubmitTranscript === undefined ? {} : { onSubmitTranscript: props.onSubmitTranscript }),
  });
  const ariaLabel = ariaLabelForStatus(capture.status, capture.disabledReason);

  if (capture.status === 'recording') {
    return (
      <div className="inline-flex items-center gap-1 rounded-sm bg-accent px-2 text-accent-content">
        <button
          aria-label="Stop recording"
          className="inline-flex h-7 cursor-pointer items-center gap-2 transition-colors hover:opacity-80"
          disabled={capture.disabled}
          onClick={capture.onClick}
          title="Stop recording"
          type="button"
        >
          <VoiceWaveform analyser={capture.analyser} className="h-4 w-12" />
          <Icon name="square" color="text-current" />
        </button>
        {capture.canSubmit ? (
          <button
            aria-label="Stop recording and send"
            className="inline-flex h-7 cursor-pointer items-center px-1 transition-colors hover:opacity-80"
            disabled={capture.disabled}
            onClick={capture.onSubmitClick}
            title="Stop recording and send"
            type="button"
          >
            <Icon name="send" color="text-current" />
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <IconButton
      aria-label={ariaLabel}
      disabled={capture.disabled}
      icon={iconForStatus(capture.status)}
      onClick={capture.onClick}
      title={capture.errorMessage.length > 0 ? capture.errorMessage : ariaLabel}
      variant="secondary"
    />
  );
}

function iconForStatus(status: VoiceCaptureStatus): string {
  switch (status) {
    case 'recording':
      return 'square';
    case 'transcribing':
      return 'loader-circle';
    case 'error':
      return 'mic-off';
    case 'idle':
      return 'mic';
  }
}

function ariaLabelForStatus(status: VoiceCaptureStatus, disabledReason: string): string {
  if (disabledReason.length > 0) return disabledReason;
  switch (status) {
    case 'recording':
      return 'Stop recording';
    case 'transcribing':
      return 'Transcribing';
    case 'error':
      return 'Voice capture error — click to retry';
    case 'idle':
      return 'Record voice message';
  }
}
