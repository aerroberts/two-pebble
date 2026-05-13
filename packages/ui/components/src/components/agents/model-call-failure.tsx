import { formatModelCallTitle } from './model-call-title';
import { TraceRow } from './trace-row';
import type { TraceComponentProps } from './types';

export function ModelCallFailureTrace(props: TraceComponentProps<'model-call-failure'>) {
  const modelCallId = props.trace.data.modelCallId;

  return (
    <TraceRow
      icon="Cpu"
      onClick={
        props.onModelCallClick === undefined || modelCallId === undefined || modelCallId.length === 0
          ? undefined
          : () => props.onModelCallClick?.(modelCallId)
      }
      status="error"
      timestamp={props.trace.createdAt}
      duration={readAggregatedModelCallDuration(props.trace.data)}
      title={formatModelCallTitle({ data: props.trace.data, verb: 'Invoked' })}
    />
  );
}

function readAggregatedModelCallDuration(data: object) {
  if (!('duration' in data)) {
    return undefined;
  }

  return typeof data.duration === 'number' ? data.duration : undefined;
}
