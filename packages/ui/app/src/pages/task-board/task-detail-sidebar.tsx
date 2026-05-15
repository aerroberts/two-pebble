import {
  AppBox,
  AppTextarea,
  Button,
  Select,
  type SelectOption,
  TaskStatusIcon,
  type TaskStatusIconStatus,
} from '@two-pebble/components';
import type { ReactNode } from 'react';

export interface TaskDetailSidebarTask {
  id: string;
  name: string;
  status: TaskStatusIconStatus;
}

export interface TaskDetailSidebarOwnerAgent {
  id: string;
  name: string;
}

export interface TaskDetailSidebarProps {
  task: TaskDetailSidebarTask;
  ownerAgent: TaskDetailSidebarOwnerAgent | null;
  descriptionDraft: string;
  delegateAgents: SelectOption[];
  delegateDisabled: boolean;
  onDescriptionChange: (value: string) => void;
  onDescriptionSave: () => void;
  onDelegate: (agentRegistryId: string) => void;
  onUndelegate: () => void;
  onOpenAgent: (agentId: string) => void;
  onStopWaitingTask: () => void;
}

const STATUS_LABEL: Record<TaskStatusIconStatus, string> = {
  blocked: 'Blocked',
  open: 'Open',
  working: 'Working',
  waiting: 'Waiting',
  success: 'Done',
  failure: 'Failed',
};

/**
 * Detail view rendered into the right-hand task panel. The task name is
 * rendered as plain text — editing happens in the list view. The panel
 * keeps to a tight column: name on the left, delegate control on the
 * right, a status + ownership row below that, and a minimalist
 * description textarea at the bottom.
 */
export function TaskDetailSidebar(props: TaskDetailSidebarProps): ReactNode {
  return (
    <>
      <AppBox variant="task-detail-header">
        <AppBox as="h2" variant="task-detail-title">
          {props.task.name || 'Untitled task'}
        </AppBox>
        <AppBox variant="task-detail-actions">{renderDelegateControl(props)}</AppBox>
      </AppBox>
      <AppBox variant="controls-row">
        <AppBox variant="controls-row">
          <TaskStatusIcon status={props.task.status} size="sm" />
          <span>{STATUS_LABEL[props.task.status]}</span>
        </AppBox>
        {props.task.status === 'waiting' ? (
          <Button leftIcon="square" onClick={props.onStopWaitingTask} variant="secondary">
            Stop
          </Button>
        ) : null}
        {props.ownerAgent !== null ? renderOwnerSummary(props) : null}
      </AppBox>
      <AppTextarea
        ariaLabel="Task description"
        onBlur={props.onDescriptionSave}
        onChange={(event) => props.onDescriptionChange(event.target.value)}
        placeholder="Describe this task"
        value={props.descriptionDraft}
      />
    </>
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
