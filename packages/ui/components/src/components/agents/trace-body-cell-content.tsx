'use client';

import { HighlightedCode } from '../code/code-block/highlighted-code';
import type { TraceBodyCellContentType } from './trace-body-cell';

export interface TraceBodyCellContentProps {
  text: string;
  type: TraceBodyCellContentType;
}

// Renders pre-formatted text either as syntax-highlighted JSON or as wrapped plaintext.
export function TraceBodyCellContent(props: TraceBodyCellContentProps) {
  if (props.type === 'json') {
    return <HighlightedCode code={props.text} language="json" compact />;
  }
  return <pre className="whitespace-pre-wrap break-words text-content">{props.text}</pre>;
}
