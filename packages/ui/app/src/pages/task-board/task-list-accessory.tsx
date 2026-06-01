import type { TrackedPrRecord } from '@two-pebble/realtime';

interface TaskListAccessoryProps {
  trackedPrs: TrackedPrRecord[];
}

/**
 * Trailing accessory rendered next to each task in the list view.
 *
 * Surfaces tracked-PR status only. Delegation/assignment is handled from
 * the task detail panel, so the list view no longer carries an inline
 * delegate dropdown.
 */
export function TaskListAccessory(props: TaskListAccessoryProps) {
  return <PrStatusIcon prs={props.trackedPrs} />;
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
  // A `pending` PR is open but not yet ready to merge (behind base, mergeability
  // still computing, or CI not green) — surface it as in-progress, not green.
  if (prs.some((pr) => pr.state === 'pending')) {
    return 'checking';
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
