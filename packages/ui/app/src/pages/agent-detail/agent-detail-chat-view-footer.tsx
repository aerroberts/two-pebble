import { IconButton, Status } from '@two-pebble/components';
import { AgentInput, type RichComposerSubmitPayload } from '../../shared/agent-input/agent-input';
import { OpenInIdeButton } from './open-in-ide-button';
import type { AgentQueuedMessageRecord } from './use-agent-detail-page-state';

interface AgentDetailChatViewFooterProps {
  agentId: string;
  chatSending: boolean;
  onCancelQueuedMessage: (messageId: string) => void;
  onChatSubmit: (payload: RichComposerSubmitPayload) => void;
  onSendQueuedMessageNow: (messageId: string) => void;
  queuedMessages?: AgentQueuedMessageRecord[];
  workspacePath: string | null;
}

export function AgentDetailChatViewFooter(props: AgentDetailChatViewFooterProps) {
  const queuedMessages = props.queuedMessages ?? [];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        <OpenInIdeButton workspacePath={props.workspacePath} />
      </div>
      {queuedMessages.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {queuedMessages.map((message) => (
            <div
              key={message.id}
              className="flex min-w-0 items-start justify-between gap-3 rounded-md border border-border bg-surface-alt px-3 py-2"
            >
              <div className="min-w-0 flex-1 truncate text-xs text-content-muted">
                {renderQueuedMessageText(message)}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Status
                  state={queuedMessageStatusToStatusState(message.status)}
                  variant="pill"
                  label={message.status}
                />
                {message.status === 'queued' ? (
                  <>
                    <IconButton
                      aria-label="Send queued message now"
                      icon="send"
                      onClick={() => props.onSendQueuedMessageNow(message.id)}
                      size={22}
                      variant="secondary"
                    />
                    <IconButton
                      aria-label="Cancel queued message"
                      icon="x"
                      onClick={() => props.onCancelQueuedMessage(message.id)}
                      size={22}
                      variant="secondary"
                    />
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
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

function queuedMessageStatusToStatusState(status: AgentQueuedMessageRecord['status']) {
  if (status === 'sent') {
    return 'success';
  }
  if (status === 'failed') {
    return 'failed';
  }
  return 'not-started';
}

function renderQueuedMessageText(message: AgentQueuedMessageRecord) {
  const text = message.cells
    .map((cell) => {
      if (cell.type === 'text' || cell.type === 'header1' || cell.type === 'header2') {
        return cell.content.text;
      }
      if (cell.type === 'codeBlock') {
        return cell.content.code;
      }
      if (cell.type === 'data') {
        return JSON.stringify(cell.content.value);
      }
      if (cell.type === 'documentReference') {
        return cell.content.name;
      }
      if (cell.type === 'boardReference') {
        return cell.content.name;
      }
      return '';
    })
    .filter((value) => value.length > 0)
    .join('\n');
  return message.status === 'failed' && message.lastError !== null ? `${text}\n${message.lastError}` : text;
}
