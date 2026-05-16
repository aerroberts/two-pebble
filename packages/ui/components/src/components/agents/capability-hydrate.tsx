import { AgentTraceItem } from './agent-trace-item';
import type { TraceComponentProps } from './types';

export function CapabilityHydrateTrace(props: TraceComponentProps<'capability-hydrate'>) {
  const data = props.trace.data;
  return (
    <AgentTraceItem
      icon="PackageOpen"
      timestamp={props.trace.createdAt}
      title={`Capability hydrated: ${data.name}`}
      status="atomic"
      content={data.description.length > 0 ? <p className="text-sm leading-5 text-content-muted">{data.description}</p> : undefined}
    />
  );
}
