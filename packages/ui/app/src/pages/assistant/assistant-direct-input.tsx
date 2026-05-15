'use client';

import { AgentInput, type RichComposerSubmitPayload } from '../../shared/agent-input/agent-input';

export interface AssistantDirectInputControlProps {
  sendChatMessage: (input: RichComposerSubmitPayload) => Promise<void>;
  chatSending: boolean;
  registryId: string | null;
}

/**
 * Direct-mode rich composer.
 *
 * Wraps the app-level `AgentInput` host so the Assistant Direct page
 * shares the same TipTap-based composer as Chat, Cmd+K, and agent
 * detail views.
 */
export function AssistantDirectInputControl(props: AssistantDirectInputControlProps) {
  return (
    <AgentInput
      ariaLabel="Assistant message"
      disabled={props.chatSending}
      draftStorageKey="composer:assistant:direct"
      onSubmit={(payload) => void props.sendChatMessage(payload)}
      placeholder="Type or speak — Enter to send, / for documents"
      submitDisabled={props.registryId === null}
    />
  );
}
