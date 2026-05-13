'use client';

import type { TraceBodyCellContentType } from './trace-body-cell';
import { TraceBodyCellContent } from './trace-body-cell-content';

export interface TraceBodyCellNumberedProps {
  text: string;
  type: TraceBodyCellContentType;
}

// Wraps TraceBodyCellContent with a right-aligned 1-indexed line-number gutter.
export function TraceBodyCellNumbered(props: TraceBodyCellNumberedProps) {
  const lines = props.text.split('\n');
  const gutterWidth = `${String(lines.length).length}ch`;
  return (
    <div className="flex">
      <div
        aria-hidden="true"
        className="shrink-0 pr-2 text-right text-content-subtle select-none"
        style={{ minWidth: gutterWidth }}
      >
        {lines.map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: line gutter is positional by nature
          <div key={i} className="leading-snug">
            {i + 1}
          </div>
        ))}
      </div>
      <div className="flex-1 min-w-0">
        <TraceBodyCellContent text={props.text} type={props.type} />
      </div>
    </div>
  );
}
