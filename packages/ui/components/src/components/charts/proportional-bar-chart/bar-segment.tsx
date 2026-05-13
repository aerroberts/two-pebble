'use client';

import { Tooltip } from '../../providers/tooltip/tooltip-trigger';
import { resolveColor } from '../utils/resolve-color';

interface BarSegmentProps {
  label: string;
  value: number;
  valueFormatter?: (value: number) => string;
  pct: string;
  widthPct: number;
  color: string;
}

export function BarSegment(props: BarSegmentProps) {
  const resolved = resolveColor(props.color);
  const value = props.valueFormatter ? props.valueFormatter(props.value) : props.value;
  return (
    <Tooltip header={props.label} data={{ Value: value, Share: `${props.pct}%` }}>
      <li
        aria-label={`${props.label}: ${props.pct}%`}
        className={`h-full cursor-default rounded-none ${resolved.tailwind ?? ''}`}
        style={{ width: `${props.widthPct}%`, ...(resolved.hex ? { backgroundColor: resolved.hex } : {}) }}
      />
    </Tooltip>
  );
}
