import type { LoadableRegistry } from '../../loadable';

export interface AgentCallsState {
  agentCalls: LoadableRegistry<AgentCallRegistryRecord>;
}

export interface AgentCallSummaryRecord {
  agentId: string;
  completedAt: number;
  errorMessage: string;
  id: string;
  modelId: string;
  provider: string;
  startedAt: number;
  status: AgentCallStatus;
  threadCellPointer: string;
}

export interface AgentCallRecord extends AgentCallSummaryRecord {
  data: object;
}

export type AgentCallRegistryRecord = AgentCallRecord | AgentCallSummaryRecord;

export interface ListAgentCallsInput {
  agentId: string;
}

export interface ReadAgentCallInput {
  id: string;
}

export interface RecordAgentCallInput {
  agentId: string;
  completedAt: number;
  data: object;
  errorMessage: string;
  id: string;
  modelId: string;
  provider: string;
  startedAt: number;
  status: AgentCallStatus;
  threadCellPointer: string;
}

export type AgentCallStatus = 'in_progress' | 'completed' | 'failed';
