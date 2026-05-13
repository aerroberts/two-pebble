import { TraceRow } from './trace-row';
import type { TraceComponentProps } from './types';

export function StateSnapshotTrace(props: TraceComponentProps<'state-snapshot'>) {
  return (
    <TraceRow
      icon="Database"
      timestamp={props.trace.createdAt}
      title={`State snapshot: ${props.trace.data.capabilityId}.${props.trace.data.name}`}
    />
  );
}
