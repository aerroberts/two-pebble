import {
  AppBox,
  Button,
  Select,
  type SelectOption,
  TaskStatusIcon,
  TaskStatusIconSelect,
  type TaskStatusIconSelectStatus,
  type TaskStatusIconStatus,
} from '@two-pebble/components';
import { markdownToTipTap } from '@two-pebble/datatypes';
import { type ReactNode, useMemo } from 'react';
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
  delegateAgents: SelectOption[];
  delegateDisabled: boolean;
  deliverables: TaskDetailSidebarDeliverable[];
  submissions: TaskDetailSidebarDeliverableSubmission[];
  onDescriptionSave: (markdown: string) => void;
  onDelegate: (agentRegistryId: string) => void;
  onUndelegate: () => void;
  onOpenAgent: (agentId: string) => void;
  onChangeStatus: (status: TaskStatusIconSelectStatus) => void;
  onCreateTemplateFromTask: () => void;
}

/**
 * Detail view rendered into the right-hand task panel. The task name is
 * rendered as plain text — editing happens in the list view. The panel
 * keeps to a tight column: name on the left, delegate control on the
 * right, a status + ownership row below that, and a minimalist
 * description textarea at the bottom.
 */
export function TaskDetailSidebar(props: TaskDetailSidebarProps): ReactNode {
  const descriptionDoc = useMemo(() => markdownToTipTap(props.description), [props.description]);
  return (
    <>
      <AppBox variant="task-detail-header">
        <AppBox variant="controls-row">
          <TaskStatusIconSelect
            ariaLabel={`Change status of ${props.task.name || 'task'}`}
            onChange={props.onChangeStatus}
            status={props.task.status}
          />
        </AppBox>
        <AppBox variant="task-detail-actions">{renderDelegateControl(props)}</AppBox>
      </AppBox>
      {props.ownerAgent !== null ? <AppBox variant="controls-row">{renderOwnerSummary(props)}</AppBox> : null}
      <RichTextFieldHost
        ariaLabel="Task description"
        minHeight={120}
        onCommit={(payload) => props.onDescriptionSave(payload.markdown)}
        placeholder="Describe this task — / to reference a document"
        value={descriptionDoc}
      />
      {props.deliverables.length > 0 ? (
        <div className="flex flex-col gap-2 pt-3">
          <AppBox variant="muted-xs">Deliverables</AppBox>
          {props.deliverables.map((deliverable) => renderDeliverableRow(deliverable, props.submissions))}
        </div>
      ) : null}
      <AppBox variant="controls-row">
        <Button leftIcon="file-text" onClick={props.onCreateTemplateFromTask} type="button" variant="secondary">
          Create template from task
        </Button>
      </AppBox>
    </>
  );
}

function renderDeliverableRow(
  deliverable: TaskDetailSidebarDeliverable,
  submissions: TaskDetailSidebarDeliverableSubmission[],
): ReactNode {
  const submission = submissions.find((entry) => entry.deliverableId === deliverable.id) ?? null;
  return (
    <div key={deliverable.id} className="flex items-start gap-2 rounded-md border border-border bg-surface-neutral p-2">
      <TaskStatusIcon status={submission === null ? 'waiting' : 'success'} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium text-content">{deliverable.name}</div>
        {deliverable.description.length > 0 ? (
          <div className="truncate text-xs text-content-muted">{deliverable.description}</div>
        ) : null}
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
