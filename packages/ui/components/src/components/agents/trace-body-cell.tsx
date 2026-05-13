'use client';

import { TraceBodyCellSection } from './trace-body-cell-section';

export type TraceBodyCellContentType = 'json' | 'plaintext';

export interface TraceBodyCellBlock {
  // How the `data` payload should be rendered — `json` pretty-prints + syntax-highlights, `plaintext` renders as-is.
  type: TraceBodyCellContentType;
  data: unknown;
  // Optional label rendered above the block content. Useful when one trace has separate request/response payloads.
  label?: string;
  // Optional max height for large payloads; the block scrolls vertically once content exceeds this size.
  maxHeight?: number;
  // When true, prepends a gutter with 1-indexed line numbers so readers can point at specific lines.
  numberLines?: boolean;
}

export interface TraceBodyCellProps extends TraceBodyCellBlock {
  // Optional second block rendered below a horizontal separator inside the same card. Useful for
  // input/output pairings (tool request + response, model prompt + completion).
  footer?: TraceBodyCellBlock;
  // When embedded in an already-bordered row, suppresses the cell's own border and radius.
  embedded?: boolean;
  framed?: boolean;
}

// Renders one or two content blocks inside a single bordered card with a horizontal separator
// between them. Used by traces that carry structured input/output payloads (tool calls).
export function TraceBodyCell(props: TraceBodyCellProps) {
  const framed = props.framed ?? true;
  const className = props.embedded
    ? 'w-full min-w-0 overflow-hidden bg-surface'
    : framed
      ? 'w-full min-w-0 overflow-hidden rounded-sm border border-border/70 bg-surface'
      : 'w-full min-w-0 overflow-hidden rounded-sm border border-border/60 bg-surface';
  const dividerClassName = 'bg-surface-alt/45 py-px';

  return (
    <div className={className}>
      <TraceBodyCellSection
        compact={!framed}
        type={props.type}
        data={props.data}
        label={props.label}
        maxHeight={props.maxHeight}
        numberLines={props.numberLines}
      />
      {props.footer !== undefined && (
        <>
          <div className={dividerClassName}>
            <div className="border-t border-border/50" />
          </div>
          <TraceBodyCellSection
            compact={!framed}
            type={props.footer.type}
            data={props.footer.data}
            label={props.footer.label}
            maxHeight={props.footer.maxHeight}
            numberLines={props.footer.numberLines}
          />
        </>
      )}
    </div>
  );
}
