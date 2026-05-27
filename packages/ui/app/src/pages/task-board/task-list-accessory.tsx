import { Select, type SelectOption } from '@two-pebble/components';
import type { ProtocolTaskRecord, TrackedPrRecord } from '@two-pebble/realtime';

const NO_AGENT_VALUE = '__none__';

interface TaskListAccessoryProps {
  task: ProtocolTaskRecord;
  ownerName: string | null;
  delegateOptions: SelectOption[];
  delegating: boolean;
  trackedPrs: TrackedPrRecord[];
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
    <>
      <PrStatusIcon prs={props.trackedPrs} />
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

function PrStatusIcon(props: { prs: TrackedPrRecord[] }) {
  if (props.prs.length === 0) {
    return null;
  }
  const state = summarizePrState(props.prs);
  const label = `${props.prs.length} tracked PR${props.prs.length === 1 ? '' : 's'}: ${state}`;
  const className =
    state === 'merged'
      ? 'text-violet-500'
      : state === 'closed'
        ? 'text-content-muted'
        : state === 'unmergeable'
          ? 'text-danger'
          : state === 'checking'
            ? 'text-warning'
            : 'text-success';
  const symbol =
    state === 'merged'
      ? '⎌'
      : state === 'closed'
        ? '×'
        : state === 'unmergeable'
          ? '!'
          : state === 'checking'
            ? '●'
            : '✓';
  return (
    <span
      aria-label={label}
      className={`inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${className}`}
      role="img"
      title={label}
    >
      {symbol}
    </span>
  );
}

function summarizePrState(prs: TrackedPrRecord[]): 'checking' | 'closed' | 'mergeable' | 'merged' | 'unmergeable' {
  if (prs.some((pr) => pr.state === 'unmergeable')) {
    return 'unmergeable';
  }
  if (prs.some((pr) => pr.state === 'mergeable' && pr.checks.some((check) => check.status !== 'completed'))) {
    return 'checking';
  }
  if (prs.some((pr) => pr.state === 'mergeable')) {
    return 'mergeable';
  }
  if (prs.some((pr) => pr.state === 'closed')) {
    return 'closed';
  }
  return 'merged';
}
