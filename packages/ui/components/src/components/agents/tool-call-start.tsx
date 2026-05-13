import { TraceRow } from './trace-row';
import { toolTraceIcon } from './trace-utils/tool-trace-icon';
import type { TraceComponentProps } from './types';

export function ToolCallStartTrace(props: TraceComponentProps<'tool-call-start'>) {
  return (
    <TraceRow
      data={props.trace.data}
      icon={toolTraceIcon(props.trace.data.source)}
      status="pending"
      timestamp={props.trace.createdAt}
      title={`Tool started: ${props.trace.data.toolId}`}
      tone="tool"
    />
  );
}
