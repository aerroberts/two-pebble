import { Icon } from '../../content/icon/icon';

export type ConcurrencyIntensity = 'idle' | 'low' | 'medium' | 'high';

export interface ConcurrencyIndicatorProps {
  /**
   * Total agents currently booked across every board (running + waiting).
   * The badge collapses to "idle" styling when this is 0.
   */
  count: number;
  /**
   * Colour band that reflects how saturated global concurrency is. Driven
   * by the ratio of booked agents to the sum of configured concurrency
   * limits when capacity is known, else by `count` alone.
   */
  intensity: ConcurrencyIntensity;
}

const intensityClass: Record<ConcurrencyIntensity, string> = {
  idle: 'border-border bg-surface text-content-muted',
  low: 'border-success-ring bg-success-soft text-success',
  medium: 'border-info bg-info/[0.16] text-info',
  high: 'border-danger-ring bg-danger-soft text-danger',
};

/**
 * Tiny pill rendered alongside the task list that surfaces the count of
 * currently-booked agents across every board. The dot communicates state
 * at a glance; the count is supplementary so users can read "how many
 * agents are working right now" without leaving the page.
 *
 * Placement is at the top of the task list view rather than repeated on
 * every row — the value is global, so repeating per row adds noise
 * without information.
 */
export function ConcurrencyIndicator(props: ConcurrencyIndicatorProps) {
  const classes = intensityClass[props.intensity];
  const label = `${props.count} agents booked across all boards`;
  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 rounded-full border px-2 text-[11px] font-medium leading-none ${classes}`}
      title={label}
    >
      <span aria-hidden className="inline-flex h-2 w-2 rounded-full bg-current opacity-80" />
      <Icon className="size-3" color="text-current" name="refresh-cw" />
      <span>{props.count} active</span>
    </span>
  );
}
