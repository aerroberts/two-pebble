import type { PebbleAgentModelCallTrace } from '../agent-traces/model-call';
import type { PebbleAgentSubAgentTrace } from '../agent-traces/sub-agent';
import type { PebbleAgentToolTrace } from '../agent-traces/tool';
import type { PebbleAgentTrace } from '../types';

export type TraceNumericPropertyMap = Record<string, number | undefined>;

export type TracePropertyKey = 'createdAt' | 'orderId' | 'sequenceId' | 'timestamp';

export interface TracePropertySource {
  type: string;
  createdAt?: number;
  orderId?: number;
  sequenceId?: number;
  timestamp?: number;
}

type AggregatedTraceMetadata<TTrace extends PebbleAgentTrace> = Omit<TTrace, 'data' | 'type'>;

export type PebbleAgentAggregatedTrace<TTrace extends PebbleAgentTrace = PebbleAgentTrace> =
  | TTrace
  | (AggregatedTraceMetadata<TTrace> & PebbleAgentModelCallTrace)
  | (AggregatedTraceMetadata<TTrace> & PebbleAgentSubAgentTrace)
  | (AggregatedTraceMetadata<TTrace> & PebbleAgentToolTrace);

export type PebbleAgentAggregatedTraceList<TTrace extends PebbleAgentTrace = PebbleAgentTrace> =
  PebbleAgentAggregatedTrace<TTrace>[];
