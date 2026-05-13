import { AppBox, AppTextarea, Button, Select, type SelectOption } from '@two-pebble/components';
import type { ReactNode } from 'react';

export interface TaskDetailSidebarTask {
  id: string;
  name: string;
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
}

/**
 * Read-only detail view rendered into the right-hand task panel. The task
 * name is rendered as plain text — editing happens in the list view. The
 * panel keeps to a tight column: name on the left, delegate control on
 * the right, and a minimalist description textarea below. No status,
 * dependencies, blocks, or event log here.
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
