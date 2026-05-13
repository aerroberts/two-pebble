import type { DurationInputDate } from './duration';

type NullableDate = Date | null;
type NullableDuration = number | null | undefined;

export function toDate(value: DurationInputDate): NullableDate {
  if (value === null || value === undefined) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDuration(milliseconds: number): string {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return '-';

  const totalMs = Math.floor(milliseconds);
  const totalSeconds = Math.floor(totalMs / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const totalDays = Math.floor(totalHours / 24);
  const days = totalDays % 7;
  const weeks = Math.floor(totalDays / 7);

  if (weeks) return `${weeks} week${weeks === 1 ? '' : 's'}`;
  if (days) return `${days} day${days === 1 ? '' : 's'}`;
  if (hours) return `${hours} hour${hours === 1 ? '' : 's'}`;
  if (minutes) return `${minutes} minute${minutes === 1 ? '' : 's'}`;

  if (totalSeconds >= 1) return `${seconds} second${seconds === 1 ? '' : 's'}`;
  return 'less than 1 second';
}

// Ultra-compact duration for inline/dense UIs: "120ms", "42s", "2m", "3h", "4d", "5w". Shows the
// largest whole unit only; nothing under a millisecond.
export function formatDurationShort(milliseconds: number): string {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return '-';

  const totalMs = Math.floor(milliseconds);
  if (totalMs < 1000) return `${totalMs}ms`;

  const totalSeconds = Math.floor(totalMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);
  const weeks = Math.floor(totalDays / 7);

  if (weeks) return `${weeks}w`;
  if (totalDays) return `${totalDays}d`;
  if (totalHours) return `${totalHours}h`;
  if (totalMinutes) return `${totalMinutes}m`;
  return `${totalSeconds}s`;
}

export function formatAbsoluteDuration(milliseconds: number): string {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return '-';

  const totalMs = Math.floor(milliseconds);
  const ms = totalMs % 1000;
  const totalSeconds = Math.floor(totalMs / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);

  const mins = String(totalMinutes).padStart(2, '0');
  const secs = String(seconds).padStart(2, '0');
  const millis = String(ms).padStart(3, '0');

  return `${mins}:${secs}.${millis}`;
}

export function formatAbsoluteTime(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export interface ComputedDuration {
  computedMs: number | null;
  startDate: NullableDate;
  endDate: NullableDate;
}

export function computeDuration(
  start: DurationInputDate,
  end: DurationInputDate,
  duration: NullableDuration,
): ComputedDuration {
  const startD = toDate(start ?? null);
  const endD = toDate(end ?? new Date());

  if (duration !== null && duration !== undefined) {
    return { computedMs: duration, startDate: startD, endDate: endD };
  }

  if (!startD) return { computedMs: null, startDate: null, endDate: null };
  if (!endD) return { computedMs: null, startDate: startD, endDate: null };

  return {
    computedMs: Math.max(0, endD.getTime() - startD.getTime()),
    startDate: startD,
    endDate: endD,
  };
}
