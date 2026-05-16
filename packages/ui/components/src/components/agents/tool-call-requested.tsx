import { AgentTraceItem } from './agent-trace-item';
import { TraceBodyCell } from './trace-body-cell';
import type { TraceComponentProps } from './types';

export function ToolCallRequestedTrace(props: TraceComponentProps<'tool-call-requested'>) {
  const data = props.trace.data;
  return (
    <AgentTraceItem
      icon="ArrowRight"
      timestamp={props.trace.createdAt}
      title={`Tool requested: ${data.toolId}`}
      status="atomic"
      content={<TraceBodyCell type="json" data={data.input} maxHeight={160} />}
    />
  );
}
