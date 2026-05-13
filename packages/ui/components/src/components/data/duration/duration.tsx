'use client';

import { Info } from 'lucide-react';
import { useMemo } from 'react';

import { Tooltip } from '../../providers/tooltip/tooltip-trigger';
import {
  computeDuration,
  formatAbsoluteDuration,
  formatAbsoluteTime,
  formatDuration,
  formatDurationShort,
} from './duration-utils';

export type DurationInputDate = string | number | Date | null | undefined;

export interface DurationProps {
  duration?: number | null | undefined;
  start?: DurationInputDate;
  end?: DurationInputDate;
  prefix?: string;
  className?: string;
  // When true, renders the ultra-compact single-unit format ("42s", "2m") instead of the verbose
  // "42 seconds" form. The hover tooltip still shows the full breakdown.
  compact?: boolean;
  hideInfoIcon?: boolean;
}

export function Duration(props: DurationProps) {
  const computed = useMemo(
    () => computeDuration(props.start, props.end, props.duration),
    [props.duration, props.start, props.end],
  );

  if (computed.computedMs === null) {
    return <span className={`text-content-muted ${props.className ?? ''}`}>—</span>;
  }

  const relativeText = formatDuration(computed.computedMs);
  const shortText = formatDurationShort(computed.computedMs);
  const absoluteDurationText = formatAbsoluteDuration(computed.computedMs);
  const tooltipData =
    computed.startDate != null || computed.endDate != null
      ? {
          Start: computed.startDate ? formatAbsoluteTime(computed.startDate) : '—',
          End: computed.endDate ? formatAbsoluteTime(computed.endDate) : '—',
          Duration: relativeText,
          Time: absoluteDurationText,
        }
      : {
          Duration: relativeText,
          Time: absoluteDurationText,
        };
  const rendered = props.compact ? shortText : relativeText;
  const displayText = props.prefix ? `${props.prefix} ${rendered}` : rendered;
  const sizeClass = props.compact ? 'text-xs text-content-muted' : '';

  return (
    <Tooltip data={tooltipData}>
      <span
        className={`-mx-1 inline-flex cursor-default items-center gap-1 whitespace-nowrap rounded-sm px-1 py-0.5 transition-colors hover:bg-accent/[0.08] ${sizeClass} ${props.className ?? ''}`.trim()}
      >
        {displayText}
        {props.hideInfoIcon ? null : <Info className="size-3 shrink-0 text-content-muted" aria-hidden="true" />}
      </span>
    </Tooltip>
  );
}
