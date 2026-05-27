import { AgentInput, type RichComposerSubmitPayload } from '../../shared/agent-input/agent-input';
import { OpenInIdeButton } from './open-in-ide-button';

interface AgentDetailChatViewFooterProps {
  agentId: string;
  chatSending: boolean;
  onChatSubmit: (payload: RichComposerSubmitPayload) => void;
  workspacePath: string | null;
}

export function AgentDetailChatViewFooter(props: AgentDetailChatViewFooterProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        <OpenInIdeButton workspacePath={props.workspacePath} />
      </div>
      <AgentInput
        ariaLabel="Follow-up message"
        disabled={props.chatSending}
        draftStorageKey={`composer:agent-detail:${props.agentId}`}
        onSubmit={(payload) => props.onChatSubmit(payload)}
        placeholder="Send a follow-up — Enter to send, / for documents"
      />
    </div>
  );
}
