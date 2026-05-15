import { AgentInput, type RichComposerSubmitPayload } from '../../shared/agent-input/agent-input';

interface AgentDetailChatViewFooterProps {
  agentId: string;
  chatSending: boolean;
  onChatSubmit: (payload: RichComposerSubmitPayload) => void;
}

export function AgentDetailChatViewFooter(props: AgentDetailChatViewFooterProps) {
  return (
    <AgentInput
      ariaLabel="Follow-up message"
      disabled={props.chatSending}
      draftStorageKey={`composer:agent-detail:${props.agentId}`}
      onSubmit={(payload) => props.onChatSubmit(payload)}
      placeholder="Send a follow-up — Enter to send, / for documents"
    />
  );
}
