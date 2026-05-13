import { TraceRow } from './trace-row';
import { renderCellInputForTrace } from './trace-utils/render-cell-input-for-trace';
import type { TraceComponentProps } from './types';

export function CapabilityExitBlockedTrace(props: TraceComponentProps<'capability-exit-blocked'>) {
  const reason = stringifyTraceContent(renderCellInputForTrace(props.trace.data.reason));

  return (
    <TraceRow
      icon="ShieldOff"
      status="error"
      timestamp={props.trace.createdAt}
      title={`${props.trace.data.capabilityId} prevented exit, ${reason}`}
    />
  );
}

function stringifyTraceContent(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}
