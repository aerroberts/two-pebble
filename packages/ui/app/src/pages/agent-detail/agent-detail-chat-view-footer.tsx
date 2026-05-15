import { AgentInput } from '../../shared/agent-input/agent-input';

interface AgentDetailChatViewFooterProps {
  chatDraft: string;
  chatSending: boolean;
  onChatDraftChange: (value: string) => void;
  onChatSubmit: (override?: string) => void;
}

export function AgentDetailChatViewFooter(props: AgentDetailChatViewFooterProps) {
  return (
    <AgentInput
      ariaLabel="Follow-up message"
      disabled={props.chatSending}
      onChange={props.onChatDraftChange}
      onSubmit={(text) => props.onChatSubmit(text)}
      placeholder="Send a follow-up message — Enter to send, Shift+Enter for newline"
      value={props.chatDraft}
    />
  );
}
