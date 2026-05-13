import type { PebbleAgentTrace } from '../../types';
import type { PebbleAgentAggregatedTrace } from '../types';

export type ToolLifecycleTrace = Extract<
  PebbleAgentTrace,
  { type: 'tool-call-failure' | 'tool-call-start' | 'tool-call-success' }
>;

export type ToolLifecycleTraceList = ToolLifecycleTrace[];

export type ModelLifecycleTrace = Extract<
  PebbleAgentTrace,
  { type: 'model-call-failure' | 'model-call-start' | 'model-call-success' }
>;

export type ModelLifecycleTraceList = ModelLifecycleTrace[];

export type SubAgentLifecycleTrace = Extract<
  PebbleAgentTrace,
  { type: 'sub-agent-failure' | 'sub-agent-invoke' | 'sub-agent-success' }
>;

export type SubAgentLifecycleTraceList = SubAgentLifecycleTrace[];

export type ModelCallStartLifecycleTrace = Extract<PebbleAgentTrace, { type: 'model-call-start' }>;

export type AggregatedModelLifecycleTrace = PebbleAgentAggregatedTrace & ModelLifecycleTrace;
export type AggregatedModelStartTrace = PebbleAgentAggregatedTrace & ModelCallStartLifecycleTrace;
export type AggregatedModelLifecycleTraceList = AggregatedModelLifecycleTrace[];

export type AggregatedToolLifecycleTrace = PebbleAgentAggregatedTrace & ToolLifecycleTrace;
export type AggregatedToolLifecycleTraceList = AggregatedToolLifecycleTrace[];

export type AggregatedSubAgentLifecycleTrace = PebbleAgentAggregatedTrace & SubAgentLifecycleTrace;
export type AggregatedSubAgentLifecycleTraceList = AggregatedSubAgentLifecycleTrace[];
