'use client';

import { stringifyJsonForDisplay } from '../code/json/json-utils';
import type { TraceBodyCellContentType } from './trace-body-cell';
import { TraceBodyCellContent } from './trace-body-cell-content';
import { TraceBodyCellNumbered } from './trace-body-cell-numbered';

export interface TraceBodyCellSectionProps {
  compact?: boolean;
  type: TraceBodyCellContentType;
  data: unknown;
  label?: string;
  maxHeight?: number;
  numberLines?: boolean;
}

// Renders a single block within a TraceBodyCell — monospace, scrolls horizontally, optionally
// prepends a 1-indexed line-number gutter.
export function TraceBodyCellSection(props: TraceBodyCellSectionProps) {
  const text =
    props.type === 'json'
      ? stringifyJsonForDisplay(props.data)
      : typeof props.data === 'string'
        ? props.data
        : String(props.data ?? '');
  const scrollClass = props.maxHeight === undefined ? 'overflow-x-auto' : 'overflow-auto';
  const paddingClass = props.compact ? 'p-2' : 'px-2.5 py-1.5';
  const contentClassName = `w-full min-w-0 bg-surface font-mono text-[11px] leading-snug ${paddingClass} ${scrollClass}`;

  return (
    <div className="w-full min-w-0">
      {props.label !== undefined && (
        <div className="border-b border-border/50 bg-surface px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-content-muted">
          {props.label}
        </div>
      )}
      <div
        className={contentClassName}
        style={props.maxHeight === undefined ? undefined : { maxHeight: props.maxHeight }}
      >
        {props.numberLines ? (
          <TraceBodyCellNumbered text={text} type={props.type} />
        ) : (
          <TraceBodyCellContent text={text} type={props.type} />
        )}
      </div>
    </div>
  );
}
