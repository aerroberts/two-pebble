import type { PebbleAgentTrace } from '@two-pebble/pebble';
import type { LoadableRegistry } from '../../loadable';

export interface AgentTracesState {
  agentTraces: LoadableRegistry<AgentTraceRecord>;
}

export type AgentTraceRecord = PebbleAgentTrace extends infer Trace
  ? Trace extends PebbleAgentTrace
    ? Trace & {
        agentId: string;
        createdAt: number;
        id: string;
        orderId: number;
      }
    : never
  : never;

export interface ListAgentTracesInput {
  agentId: string;
}

export type RecordAgentTraceInput = PebbleAgentTrace extends infer Trace
  ? Trace extends PebbleAgentTrace
    ? Trace & {
        agentId: string;
        id: string;
        orderId: number;
      }
    : never
  : never;
