'use client';

import { IconButton, InputArea } from '@two-pebble/components';
import { useEffect, useRef, useState } from 'react';
import type { VoiceCaptureStatus } from '../../shared/voice/use-voice-capture';
import { VoiceCaptureButton } from '../../shared/voice/voice-capture-button';

export interface AssistantDirectInputControlProps {
  chatDraft: string;
  setChatDraft: (value: string) => void;
  sendChatMessage: (override?: string) => Promise<void>;
  chatSending: boolean;
  registryId: string | null;
  /**
   * Notified whenever the voice capture flow changes state so the parent
   * can disable sibling chrome (e.g. tab switching) while recording.
   */
  onVoiceStatusChange?: (status: VoiceCaptureStatus) => void;
}

type DirectInputMode = 'idle' | 'text';

/**
 * Direct-mode dual-button input cluster. Two small icon buttons sit
 * side-by-side: mic (voice) and pencil (text). Tapping the pencil
 * animates a text input open below the row; tapping the mic enters the
 * `VoiceCaptureButton` recording state. The cluster sizing matches the
 * rest of the app — small secondary icon buttons, not oversized primary
 * blocks — so it reads as inline chrome rather than a hero CTA.
 */
export function AssistantDirectInputControl(props: AssistantDirectInputControlProps) {
  const [mode, setMode] = useState<DirectInputMode>('idle');
  const [voiceStatus, setVoiceStatus] = useState<VoiceCaptureStatus>('idle');
  const inputWrapperRef = useRef<HTMLDivElement | null>(null);

  const isRecording = voiceStatus === 'recording';
  const showTextInput = mode === 'text' && !isRecording;
  const showButtons = !showTextInput;

  const onVoiceStatusChange = props.onVoiceStatusChange;
  useEffect(() => {
    onVoiceStatusChange?.(voiceStatus);
  }, [onVoiceStatusChange, voiceStatus]);

  useEffect(() => {
    if (!showTextInput) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      inputWrapperRef.current?.querySelector('textarea')?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [showTextInput]);

  const sendDisabled = props.chatSending || props.chatDraft.trim().length === 0 || props.registryId === null;

  const handleSubmit = async () => {
    if (sendDisabled) {
      return;
    }
    setMode('idle');
    await props.sendChatMessage();
  };

  const handleCancelText = () => {
    setMode('idle');
    props.setChatDraft('');
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div
        aria-hidden={!showButtons}
        className={`flex items-center gap-2 transition-[opacity,transform] duration-200 ease-out ${
          showButtons ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-0.5 opacity-0'
        }`}
      >
        <VoiceCaptureButton
          onStatusChange={setVoiceStatus}
          onTranscript={(text) => props.setChatDraft(joinTranscript(props.chatDraft, text))}
          onSubmitTranscript={(text) => {
            const next = joinTranscript(props.chatDraft, text);
            props.setChatDraft(next);
            if (next.trim().length > 0 && props.registryId !== null && !props.chatSending) {
              void props.sendChatMessage(next);
            }
          }}
          submitOnly
        />
        {isRecording ? null : (
          <IconButton aria-label="Open text input" icon="pencil" onClick={() => setMode('text')} variant="secondary" />
        )}
      </div>

      <div
        aria-hidden={!showTextInput}
        className={`w-full overflow-hidden transition-[opacity,max-height,transform] duration-200 ease-out ${
          showTextInput ? 'max-h-40 translate-y-0 opacity-100' : 'pointer-events-none max-h-0 translate-y-0.5 opacity-0'
        }`}
        ref={inputWrapperRef}
      >
        <InputArea
          aria-label="Assistant message"
          disabled={props.chatSending}
          onChange={(event) => props.setChatDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void handleSubmit();
            }
            if (event.key === 'Escape') {
              event.preventDefault();
              handleCancelText();
            }
          }}
          placeholder="Type a message — Enter to send, Esc to cancel"
          value={props.chatDraft}
        />
        <div className="mt-2 flex justify-end gap-2">
          <IconButton aria-label="Close text input" icon="x" onClick={handleCancelText} variant="secondary" />
          <IconButton
            aria-label="Send message"
            disabled={sendDisabled}
            icon="send"
            onClick={() => void handleSubmit()}
          />
        </div>
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
