'use client';

import { IconButton } from '@two-pebble/components';
import { useEffect, useRef, useState } from 'react';
import type { VoiceCaptureStatus } from '../voice/use-voice-capture';
import { VoiceCaptureButton } from '../voice/voice-capture-button';

export interface AgentInputProps {
  /** Current text draft. */
  value: string;
  onChange: (value: string) => void;
  /** Called when the user submits via Enter or finishes a voice turn. */
  onSubmit: (text: string) => void;
  /** Render as disabled (e.g. while a send is in flight). */
  disabled?: boolean;
  /**
   * Block submission even if `value` is non-empty (e.g. waiting on a
   * prerequisite like an agent registry selection). The text input itself
   * stays editable.
   */
  submitDisabled?: boolean;
  placeholder?: string;
  ariaLabel?: string;
  /**
   * Open straight into voice mode and auto-start recording. Used by surfaces
   * that mount with the explicit intent to capture speech (e.g. cmd-K with
   * the "start in voice mode" preference).
   */
  initialMode?: 'text' | 'voice';
  /** Notified whenever voice capture status changes; useful for dimming sibling chrome. */
  onVoiceStatusChange?: (status: VoiceCaptureStatus) => void;
}

/**
 * Unified agent message composer.
 *
 * Default layout is a single textarea with a small mic icon button anchored
 * to its top-right. Clicking the mic collapses the textarea and slides a
 * centered voice button into its place; finishing the voice turn appends the
 * transcript to the draft and returns to text mode. Surfaces that want to
 * skip the text step entirely can mount with `initialMode='voice'`, which
 * starts the mic immediately on first paint.
 */
export function AgentInput(props: AgentInputProps) {
  const initialMode = props.initialMode ?? 'text';
  const [mode, setMode] = useState<'text' | 'voice'>(initialMode);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleVoiceStatus = (status: VoiceCaptureStatus) => {
    props.onVoiceStatusChange?.(status);
    if (status === 'idle' && mode === 'voice') {
      setMode('text');
    }
  };

  const handleTranscript = (text: string) => {
    props.onChange(joinTranscript(props.value, text));
  };

  const handleSubmitTranscript = (text: string) => {
    const next = joinTranscript(props.value, text);
    props.onChange(next);
    if (next.trim().length > 0 && !props.submitDisabled && !props.disabled) {
      props.onSubmit(next);
    }
  };

  const submitDisabled = (props.submitDisabled ?? false) || props.value.trim().length === 0;

  const submitFromText = () => {
    if (submitDisabled || props.disabled) {
      return;
    }
    props.onSubmit(props.value);
  };

  // When entering text mode (whether on mount or after a voice turn), focus
  // the textarea so the user can type immediately.
  useEffect(() => {
    if (mode === 'text') {
      const frame = requestAnimationFrame(() => textareaRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    }
    return undefined;
  }, [mode]);

  const showText = mode === 'text';

  return (
    <div className="relative flex w-full flex-col">
      <div
        aria-hidden={!showText}
        className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${
          showText ? 'max-h-80 opacity-100' : 'pointer-events-none max-h-0 opacity-0'
        }`}
      >
        <div className="relative flex rounded-md border border-border bg-surface transition-[border-color] duration-200 focus-within:border-accent">
          <textarea
            aria-label={props.ariaLabel ?? 'Agent input'}
            className="h-full min-h-[5rem] w-full resize-y bg-transparent py-1.5 pl-2 pr-10 text-[12px] font-medium leading-4 text-content outline-none placeholder:text-content-muted"
            disabled={props.disabled}
            onChange={(event) => props.onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                submitFromText();
              }
            }}
            placeholder={props.placeholder ?? 'Type a message — Enter to send, Shift+Enter for newline'}
            ref={textareaRef}
            value={props.value}
          />
          <div className="absolute right-1.5 top-1.5">
            <IconButton
              aria-label="Switch to voice"
              icon="mic"
              onClick={() => setMode('voice')}
              size="sm"
              variant="secondary"
            />
          </div>
        </div>
      </div>
      <div
        aria-hidden={showText}
        className={`flex justify-center transition-[max-height,opacity] duration-200 ease-out ${
          showText ? 'pointer-events-none max-h-0 opacity-0' : 'max-h-40 opacity-100'
        }`}
      >
        {showText ? null : (
          <VoiceCaptureButton
            autoStart
            buttonSize="md"
            buttonVariant="primary"
            onStatusChange={handleVoiceStatus}
            onSubmitTranscript={handleSubmitTranscript}
            onTranscript={handleTranscript}
            submitOnly
          />
        )}
      </div>
    </div>
  );
}

function joinTranscript(existing: string, transcript: string): string {
  if (transcript.length === 0) {
    return existing;
  }
  if (existing.length === 0) {
    return transcript;
  }
  return existing.endsWith(' ') ? `${existing}${transcript}` : `${existing} ${transcript}`;
}
