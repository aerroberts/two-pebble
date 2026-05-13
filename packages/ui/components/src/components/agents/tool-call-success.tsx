import { TraceRow } from './trace-row';
import type { TraceComponentProps } from './types';

export function ToolCallSuccessTrace(props: TraceComponentProps<'tool-call-success'>) {
  return (
    <TraceRow
      data={props.trace.data}
      icon="Wrench"
      status="success"
      timestamp={props.trace.createdAt}
      title={`Tool succeeded: ${props.trace.data.toolCallId}`}
      tone="tool"
    />
  );
}
