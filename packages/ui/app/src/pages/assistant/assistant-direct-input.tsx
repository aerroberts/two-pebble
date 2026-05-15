'use client';

import { AgentInput } from '../../shared/agent-input/agent-input';
import type { VoiceCaptureStatus } from '../../shared/voice/use-voice-capture';

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

/**
 * Direct-mode message composer.
 *
 * Wraps the unified `AgentInput` so the Assistant Direct page uses the same
 * textarea + voice-switch input as Chat, Cmd+K, and agent detail views.
 */
export function AssistantDirectInputControl(props: AssistantDirectInputControlProps) {
  return (
    <AgentInput
      ariaLabel="Assistant message"
      disabled={props.chatSending}
      onChange={props.setChatDraft}
      onSubmit={(text) => void props.sendChatMessage(text)}
      onVoiceStatusChange={props.onVoiceStatusChange}
      placeholder="Type or speak — Enter to send, Shift+Enter for newline"
      submitDisabled={props.registryId === null}
      value={props.chatDraft}
    />
  );
}
