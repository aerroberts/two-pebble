import { Button, Select, type SelectOption } from '@two-pebble/components';
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
      <div className="flex items-start justify-between gap-3 pb-3">
        <h2 className="min-w-0 flex-1 truncate text-sm font-medium text-content">
          {props.task.name || 'Untitled task'}
        </h2>
        <div className="shrink-0">{renderDelegateControl(props)}</div>
      </div>
      <textarea
        aria-label="Task description"
        onBlur={props.onDescriptionSave}
        onChange={(event) => props.onDescriptionChange(event.target.value)}
        placeholder="Describe this task"
        value={props.descriptionDraft}
        className="block w-full min-h-[14rem] resize-y rounded-md border border-border bg-surface-neutral px-3 py-2 text-sm leading-5 text-content outline-none placeholder:text-content-subtle focus:border-strong"
      />
    </>
  );
}

function renderDelegateControl(props: TaskDetailSidebarProps): ReactNode {
  if (props.ownerAgent !== null) {
    const owner = props.ownerAgent;
    return (
      <div className="flex items-center gap-2">
        <Button leftIcon="bot" onClick={() => props.onOpenAgent(owner.id)} variant="secondary">
          {owner.name}
        </Button>
        <Button onClick={props.onUndelegate} variant="secondary">
          Undelegate
        </Button>
      </div>
    );
  }
  if (props.delegateAgents.length === 0) return null;
  return (
    <Select
      options={props.delegateAgents}
      placeholder="Delegate"
      disabled={props.delegateDisabled}
      onChange={props.onDelegate}
    />
  );
}
