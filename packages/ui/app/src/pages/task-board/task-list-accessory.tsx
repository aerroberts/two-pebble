import { Select, type SelectOption } from '@two-pebble/components';
import type { ProtocolTaskRecord } from '@two-pebble/realtime';

const NO_AGENT_VALUE = '__none__';

interface TaskListAccessoryProps {
  task: ProtocolTaskRecord;
  ownerName: string | null;
  delegateOptions: SelectOption[];
  delegating: boolean;
  onDelegate: (agentRegistryId: string) => void;
  onUndelegate: () => void;
}

/**
 * Inline delegate control rendered next to each task in the list view.
 *
 * Shows the current assignee and lets the user delegate to another
 * agent registry or revoke the delegation (the synthetic `__none__`
 * option triggers undelegate). Status changes happen via the leading
 * status icon dropdown — see `TaskStatusIconSelect`.
 */
export function TaskListAccessory(props: TaskListAccessoryProps) {
  const currentOwnerValue = props.task.ownerId === null ? NO_AGENT_VALUE : (props.task.ownerId ?? NO_AGENT_VALUE);
  const delegateOptionsWithNone: SelectOption[] = [
    { value: NO_AGENT_VALUE, label: props.ownerName === null ? 'Unassigned' : 'Unassign' },
    ...props.delegateOptions,
  ];

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
    <Select
      aria-label={`Task ${props.task.name} owner`}
      disabled={props.delegating || props.delegateOptions.length === 0}
      onChange={onDelegateChange}
      options={delegateOptionsWithNone}
      placeholder="Delegate"
      value={currentOwnerValue}
      variant="borderless"
    />
  );
}
