import { TraceRow } from './trace-row';
import type { TraceComponentProps } from './types';

export function TurnStartTrace(props: TraceComponentProps<'turn-start'>) {
  return <TraceRow icon="Settings" timestamp={props.trace.createdAt} title={formatTurnTitle(props.trace.data)} />;
}

function formatTurnTitle(data: TraceComponentProps<'turn-start'>['trace']['data']) {
  if (data.totalSteps === undefined) {
    return `Step ${data.step}`;
  }

  return `Step ${data.step} out of ${data.totalSteps}`;
}
