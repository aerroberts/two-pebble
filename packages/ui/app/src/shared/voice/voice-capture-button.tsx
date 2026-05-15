import type { IconButtonSize } from '@two-pebble/components';
import { AppBox, AppButton, Icon, IconButton, VoiceWaveformDisplay } from '@two-pebble/components';
import { useEffect, useRef } from 'react';
import { useVoiceCapture, type VoiceCaptureStatus } from './use-voice-capture';

interface VoiceCaptureButtonProps {
  onTranscript: (text: string) => void;
  onSubmitTranscript?: (text: string) => void;
  /**
   * Notified each time the capture status changes. Parent pages use this to gate
   * sibling controls (e.g. gray out the input box while recording).
   */
  onStatusChange?: (status: VoiceCaptureStatus) => void;
  /**
   * Hide the stop-without-send affordance while recording. Surfaces with no
   * visible text input have nowhere to land a bare transcript, so the only
   * meaningful end-state is "send" — `submitOnly` suppresses the stop button
   * and keeps the waveform as a passive indicator alongside the send button.
   */
  submitOnly?: boolean;
  /** Size of the idle / non-recording mic button. Mirrors IconButton's prop. */
  buttonSize?: IconButtonSize | number;
  /** Variant of the idle / non-recording mic button. Defaults to secondary. */
  buttonVariant?: 'primary' | 'secondary';
  /**
   * Auto-start recording on first mount once the capture pipeline is ready.
   * Used by surfaces that open into voice mode (e.g. cmd-K with the
   * "start in voice mode" setting on).
   */
  autoStart?: boolean;
}

export function VoiceCaptureButton(props: VoiceCaptureButtonProps) {
  const capture = useVoiceCapture({
    onTranscript: props.onTranscript,
    ...(props.onSubmitTranscript === undefined ? {} : { onSubmitTranscript: props.onSubmitTranscript }),
  });
  const ariaLabel = ariaLabelForStatus(capture.status, capture.disabledReason);
  const onStatusChange = props.onStatusChange;
  const hideStop = props.submitOnly === true && capture.canSubmit;
  const autoStartedRef = useRef(false);

  useEffect(() => {
    onStatusChange?.(capture.status);
  }, [capture.status, onStatusChange]);

  useEffect(() => {
    if (!props.autoStart || autoStartedRef.current || capture.disabled || capture.status !== 'idle') {
      return;
    }
    autoStartedRef.current = true;
    capture.onClick();
  }, [props.autoStart, capture.disabled, capture.status, capture.onClick]);

  if (capture.status === 'recording') {
    return (
      <AppBox variant="voice-pill">
        {hideStop ? (
          <span className="inline-flex items-center px-1" aria-hidden="true">
            <VoiceWaveformDisplay analyser={capture.analyser} />
          </span>
        ) : (
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
        )}
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

  if (capture.status === 'transcribing') {
    return (
      <AppBox variant="voice-pill" aria-label={ariaLabel}>
        <span className="inline-flex items-center px-2" aria-hidden="true">
          <VoiceWaveformDisplay analyser={null} pulse />
        </span>
      </AppBox>
    );
  }

  return (
    <IconButton
      aria-label={ariaLabel}
      disabled={capture.disabled}
      icon={iconForStatus(capture.status)}
      onClick={capture.onClick}
      size={props.buttonSize ?? 'sm'}
      title={capture.errorMessage.length > 0 ? capture.errorMessage : ariaLabel}
      variant={props.buttonVariant ?? 'secondary'}
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
