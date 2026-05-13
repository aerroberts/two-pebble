import type { PebbleAgentTrace } from '../types';
import { TraceAggregator } from './trace-aggregator';
import type { PebbleAgentAggregatedTraceList } from './types';

export function aggregatePebbleAgentTraces<TTrace extends PebbleAgentTrace>(
  traces: TTrace[],
): PebbleAgentAggregatedTraceList<TTrace> {
  return new TraceAggregator(traces).aggregate();
}
