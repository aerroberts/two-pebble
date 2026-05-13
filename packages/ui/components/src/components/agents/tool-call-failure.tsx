import { TraceRow } from './trace-row';
import type { TraceComponentProps } from './types';

export function ToolCallFailureTrace(props: TraceComponentProps<'tool-call-failure'>) {
  return (
    <TraceRow
      data={props.trace.data}
      icon="Wrench"
      status="error"
      timestamp={props.trace.createdAt}
      title={`Tool failed: ${props.trace.data.toolCallId}`}
      tone="tool"
    />
  );
}
