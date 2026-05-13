import { formatModelCallTitle } from './model-call-title';
import { TraceRow } from './trace-row';
import type { TraceComponentProps } from './types';

export function ModelCallStartTrace(props: TraceComponentProps<'model-call-start'>) {
  return (
    <TraceRow
      icon="Cpu"
      status="pending"
      timestamp={props.trace.createdAt}
      title={formatModelCallTitle({ data: props.trace.data, verb: 'Invoking' })}
    />
  );
}
