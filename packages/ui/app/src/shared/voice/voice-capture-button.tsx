import { AppBox, AppButton, Icon, IconButton, VoiceWaveformDisplay } from '@two-pebble/components';
import { useEffect } from 'react';
import { useVoiceCapture, type VoiceCaptureStatus } from './use-voice-capture';

interface VoiceCaptureButtonProps {
  onTranscript: (text: string) => void;
  onSubmitTranscript?: (text: string) => void;
  /**
   * Notified each time the capture status changes. Parent pages use this to gate
   * sibling controls (e.g. gray out the input box while recording).
   */
  onStatusChange?: (status: VoiceCaptureStatus) => void;
}

export function VoiceCaptureButton(props: VoiceCaptureButtonProps) {
  const capture = useVoiceCapture({
    onTranscript: props.onTranscript,
    ...(props.onSubmitTranscript === undefined ? {} : { onSubmitTranscript: props.onSubmitTranscript }),
  });
  const ariaLabel = ariaLabelForStatus(capture.status, capture.disabledReason);
  const onStatusChange = props.onStatusChange;

  useEffect(() => {
    onStatusChange?.(capture.status);
  }, [capture.status, onStatusChange]);

  if (capture.status === 'recording') {
    return (
      <AppBox variant="voice-pill">
        <AppButton
          aria-label="Stop recording"
          disabled={capture.disabled}
          onClick={capture.onClick}
          title="Stop recording"
          type="button"
          variant="voice-record"
        >
          <VoiceWaveformDisplay analyser={capture.analyser} />
          <Icon name="square" color="text-current" />
        </AppButton>
        {capture.canSubmit ? (
          <AppButton
            aria-label="Stop recording and send"
            disabled={capture.disabled}
            onClick={capture.onSubmitClick}
            title="Stop recording and send"
            type="button"
            variant="voice-submit"
          >
            <Icon name="send" color="text-current" />
          </AppButton>
        ) : null}
      </AppBox>
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
  if (disabledReason.length > 0) {
    return disabledReason;
  }
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
