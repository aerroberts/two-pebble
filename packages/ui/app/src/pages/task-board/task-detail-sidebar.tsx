import {
  AppBox,
  Button,
  Icon,
  IconButton,
  Input,
  type JSONContent,
  type RichComposerSubmitPayload,
  type RichComposerTask,
  Select,
  type SelectOption,
  TaskStatusIcon,
  type TaskStatusIconStatus,
} from '@two-pebble/components';
import { markdownToTipTap } from '@two-pebble/datatypes';
import type { TaskEventRecord } from '@two-pebble/realtime';
import { type ReactNode, useMemo, useState } from 'react';
import { RichTextFieldHost } from '../../shared/agent-input/rich-text-field-host';

export interface TaskDetailSidebarTask {
  id: string;
  name: string;
  status: TaskStatusIconStatus;
}

export interface TaskDetailSidebarOwnerAgent {
  id: string;
  name: string;
}

export interface TaskDetailSidebarDeliverable {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'pr_url';
}

export interface TaskDetailSidebarDeliverableSubmission {
  deliverableId: string;
  payload: { type: 'text'; content: string } | { type: 'pr_url'; url: string };
}

export interface TaskDetailSidebarProps {
  task: TaskDetailSidebarTask;
  ownerAgent: TaskDetailSidebarOwnerAgent | null;
  description: string;
  descriptionContent: string | null;
  taskReferences: ReadonlyArray<RichComposerTask>;
  delegateAgents: SelectOption[];
  delegateDisabled: boolean;
  deliverables: TaskDetailSidebarDeliverable[];
  submissions: TaskDetailSidebarDeliverableSubmission[];
  events: TaskEventRecord[];
  onDescriptionSave: (markdown: string, content: string) => void;
  onDelegate: (agentRegistryId: string) => void;
  onUndelegate: () => void;
  onOpenAgent: (agentId: string) => void;
  onCreateTemplateFromTask: () => void;
  onAddDeliverable: () => void;
  onUpdateDeliverable: (input: { id: string; name?: string; description?: string; type?: 'text' | 'pr_url' }) => void;
  onDeleteDeliverable: (id: string) => void;
  onAddComment: (body: string) => void;
  onDeleteTask: () => void;
}

const DELIVERABLE_TYPE_OPTIONS: SelectOption[] = [
  { value: 'text', label: 'Text', icon: <Icon name="file-text" color="text-current" /> },
  { value: 'pr_url', label: 'PR URL', icon: <Icon name="git-pull-request" color="text-current" /> },
];

/**
 * Detail view rendered into the right-hand task panel. The task name is
 * rendered as plain text — editing happens in the list view. The panel
 * keeps to a tight column: name on the left, delegate control on the
 * right, a status + ownership row below that, and a minimalist
 * description textarea at the bottom.
 */
export function TaskDetailSidebar(props: TaskDetailSidebarProps): ReactNode {
  const descriptionDoc = useMemo(
    () => parseDescriptionContent(props.descriptionContent, props.description),
    [props.descriptionContent, props.description],
  );
  const handleDescriptionCommit = (payload: RichComposerSubmitPayload) => {
    props.onDescriptionSave(payload.markdown, JSON.stringify(payload.doc));
  };
  const [deliverablesOpen, setDeliverablesOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');

  return (
    <>
      <AppBox variant="task-detail-header">
        <AppBox variant="task-detail-actions">{renderDelegateControl(props)}</AppBox>
      </AppBox>
      {props.ownerAgent !== null ? <AppBox variant="controls-row">{renderOwnerSummary(props)}</AppBox> : null}
      <RichTextFieldHost
        ariaLabel="Task description"
        minHeight={120}
        onCommit={handleDescriptionCommit}
        placeholder="Describe this task — / to reference a document"
        tasks={props.taskReferences}
        value={descriptionDoc}
      />
      <div className="flex flex-col gap-2 pt-3">
        <div className="flex items-center justify-between">
          <AppBox variant="muted-xs">Deliverables ({props.deliverables.length})</AppBox>
          <IconButton
            aria-label={deliverablesOpen ? 'Hide deliverables' : 'Show deliverables'}
            icon={deliverablesOpen ? 'chevron-down' : 'chevron-right'}
            onClick={() => setDeliverablesOpen((open) => !open)}
            type="button"
            variant="secondary"
          />
        </div>
        {deliverablesOpen ? (
          <>
            {props.deliverables.map((deliverable) => (
              <DeliverableEditorRow
                key={deliverable.id}
                deliverable={deliverable}
                submission={props.submissions.find((entry) => entry.deliverableId === deliverable.id) ?? null}
                onUpdate={props.onUpdateDeliverable}
                onDelete={props.onDeleteDeliverable}
              />
            ))}
            <Button leftIcon="plus" onClick={props.onAddDeliverable} type="button" variant="secondary">
              Add deliverable
            </Button>
          </>
        ) : null}
      </div>
      <div className="flex flex-col gap-2 pt-3">
        <AppBox variant="muted-xs">Activity</AppBox>
        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <Input
              aria-label="Add a comment"
              placeholder="Add a comment..."
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
            />
          </div>
          <Button
            disabled={commentDraft.trim().length === 0}
            leftIcon="send"
            onClick={() => {
              props.onAddComment(commentDraft);
              setCommentDraft('');
            }}
            type="button"
            variant="secondary"
          >
            Comment
          </Button>
        </div>
        {props.events.length === 0 ? (
          <p className="text-xs text-content-muted">No activity yet.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {props.events.map((event) => (
              <div key={event.id} className="rounded-md border border-border bg-surface px-2 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-medium text-content">{describeEvent(event)}</span>
                  <span className="shrink-0 text-[11px] text-content-muted">
                    {new Date(event.createdAt).toLocaleString()}
                  </span>
                </div>
                {event.reason.length > 0 ? (
                  <div className="text-[11px] leading-4 text-content-muted">{event.reason}</div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
      <AppBox variant="controls-row">
        <Button leftIcon="trash" onClick={props.onDeleteTask} type="button" variant="secondary">
          Delete task
        </Button>
      </AppBox>
      <div className="mt-auto pt-3">
        <AppBox variant="controls-row">
          <Button leftIcon="file-text" onClick={props.onCreateTemplateFromTask} type="button" variant="secondary">
            Create template from task
          </Button>
        </AppBox>
      </div>
    </>
  );
}

function describeEvent(event: TaskEventRecord): string {
  switch (event.kind) {
    case 'status':
      return `Status → ${event.status}`;
    case 'delegated':
      return `Delegated to ${event.agentName}`;
    case 'undelegated':
      return 'Undelegated';
    case 'comment':
      return 'Comment';
    default:
      return 'Updated';
  }
}

function parseDescriptionContent(content: string | null, markdown: string): JSONContent {
  if (content !== null && content.length > 0) {
    try {
      const parsed = JSON.parse(content) as JSONContent;
      if (parsed.type === 'doc') {
        return parsed;
      }
    } catch {
      // Fall back to the legacy markdown column below.
    }
  }
  return markdownToTipTap(markdown);
}

interface DeliverableEditorRowProps {
  deliverable: TaskDetailSidebarDeliverable;
  submission: TaskDetailSidebarDeliverableSubmission | null;
  onUpdate: (input: { id: string; name?: string; description?: string; type?: 'text' | 'pr_url' }) => void;
  onDelete: (id: string) => void;
}

function DeliverableEditorRow(props: DeliverableEditorRowProps): ReactNode {
  const { deliverable, submission } = props;
  const [name, setName] = useState(deliverable.name);
  const [description, setDescription] = useState(deliverable.description);
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-surface p-2">
      <div className="grid grid-cols-[auto_1fr_8rem_auto] items-end gap-2">
        <div className="pb-1.5">
          <TaskStatusIcon status={submission === null ? 'waiting' : 'success'} size="sm" />
        </div>
        <Input
          aria-label="Deliverable name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={() => props.onUpdate({ id: deliverable.id, name: name.trim() || deliverable.name })}
        />
        <Select
          options={DELIVERABLE_TYPE_OPTIONS}
          value={deliverable.type}
          onChange={(value) => props.onUpdate({ id: deliverable.id, type: value as 'text' | 'pr_url' })}
        />
        <IconButton
          aria-label="Delete deliverable"
          icon="trash"
          onClick={() => props.onDelete(deliverable.id)}
          type="button"
          variant="secondary"
        />
      </div>
      <Input
        aria-label="Deliverable description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        onBlur={() => props.onUpdate({ id: deliverable.id, description })}
        placeholder="Description"
      />
      {submission === null ? (
        <div className="text-xs text-content-muted">Pending</div>
      ) : submission.payload.type === 'pr_url' ? (
        <a
          className="block truncate text-xs text-accent underline-offset-2 hover:underline"
          href={submission.payload.url}
          rel="noreferrer"
          target="_blank"
        >
          {submission.payload.url}
        </a>
      ) : (
        <div className="truncate text-xs text-content-muted">{submission.payload.content}</div>
      )}
    </div>
  );
}

function renderOwnerSummary(props: TaskDetailSidebarProps): ReactNode {
  const owner = props.ownerAgent;
  if (owner === null) {
    return null;
  }
  return (
    <AppBox variant="controls-row">
      <span>Owned by</span>
      <Button leftIcon="bot" onClick={() => props.onOpenAgent(owner.id)} variant="secondary">
        {owner.name}
      </Button>
    </AppBox>
  );
}

function renderDelegateControl(props: TaskDetailSidebarProps): ReactNode {
  if (props.ownerAgent !== null) {
    const owner = props.ownerAgent;
    return (
      <AppBox variant="controls-row">
        <Button leftIcon="bot" onClick={() => props.onOpenAgent(owner.id)} variant="secondary">
          {owner.name}
        </Button>
        <Button onClick={props.onUndelegate} variant="secondary">
          Undelegate
        </Button>
      </AppBox>
    );
  }
  if (props.delegateAgents.length === 0) {
    return null;
  }
  return (
    <Select
      options={props.delegateAgents}
      placeholder="Delegate"
      disabled={props.delegateDisabled}
      onChange={props.onDelegate}
    />
  );
}
