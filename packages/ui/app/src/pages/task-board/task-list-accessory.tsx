import { Select, type SelectOption } from '@two-pebble/components';
import type { ProtocolTaskRecord } from '@two-pebble/realtime';
import type { SettableTaskStatus } from './use-task-board-page-state';

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'working', label: 'Working' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'success', label: 'Done' },
  { value: 'failure', label: 'Failed' },
];

const NO_AGENT_VALUE = '__none__';

interface TaskListAccessoryProps {
  task: ProtocolTaskRecord;
  ownerName: string | null;
  delegateOptions: SelectOption[];
  delegating: boolean;
  onDelegate: (agentRegistryId: string) => void;
  onUndelegate: () => void;
  onStatusChange: (status: SettableTaskStatus) => void;
}

/**
 * Inline controls rendered next to each task in the list view. Two
 * controls in a single row:
 *
 *   - A compact status `Select` so the user can flip a task to
 *     Working / Waiting / Done / Failed without opening the detail
 *     sidebar. Reuses the same `mutations.setTaskStatus` flow the
 *     sidebar uses, so backend behaviour is identical.
 *   - A compact delegate `Select` that shows the current assignee and
 *     lets the user delegate to another agent registry or revoke the
 *     delegation (the synthetic `__none__` option triggers undelegate).
 *
 * Hidden when no delegate options are available (e.g. before agent
 * registries finish loading) so the row doesn't render a broken
 * dropdown.
 */
export function TaskListAccessory(props: TaskListAccessoryProps) {
  const currentOwnerValue = props.task.ownerId === null ? NO_AGENT_VALUE : (props.task.ownerId ?? NO_AGENT_VALUE);
  const delegateOptionsWithNone: SelectOption[] = [
    { value: NO_AGENT_VALUE, label: props.ownerName === null ? 'Unassigned' : 'Unassign' },
    ...props.delegateOptions,
  ];

  const onStatusChange = (value: string) => {
    props.onStatusChange(value as SettableTaskStatus);
  };

  const onDelegateChange = (value: string) => {
    if (value === NO_AGENT_VALUE) {
      if (props.task.ownerId !== null) {
        props.onUndelegate();
      }
      return;
    }
    props.onDelegate(value);
  };

  return (
    <>
      <Select
        aria-label={`Task ${props.task.name} status`}
        onChange={onStatusChange}
        options={STATUS_OPTIONS}
        placeholder="Status"
        value={props.task.effectiveStatus}
        variant="borderless"
      />
      <Select
        aria-label={`Task ${props.task.name} owner`}
        disabled={props.delegating || props.delegateOptions.length === 0}
        onChange={onDelegateChange}
        options={delegateOptionsWithNone}
        placeholder="Delegate"
        value={currentOwnerValue}
        variant="borderless"
      />
    </>
  );
}
