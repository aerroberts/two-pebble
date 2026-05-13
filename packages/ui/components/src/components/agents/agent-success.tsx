import { AgentTraceItem } from './agent-trace-item';
import type { TraceComponentProps } from './types';

export function AgentSuccessTrace(props: TraceComponentProps<'agent-success'>) {
  return (
    <AgentTraceItem
      boxed={false}
      icon="CircleCheck"
      status="success"
      timestamp={props.trace.createdAt}
      title="Agent completed"
    />
  );
}
