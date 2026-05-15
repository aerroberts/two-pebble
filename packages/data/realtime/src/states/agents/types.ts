import type { LoadableRegistry } from '../../loadable';

export interface AgentsState {
  agents: LoadableRegistry<AgentRecord>;
}

export interface AgentRecord {
  agentRegistryId?: string | null;
  completedAt: number;
  description: string;
  id: string;
  metadata: string;
  name: string;
  parentAgentId?: string | null;
  startedAt: number;
  status: AgentStatus;
}

export interface CreateAgentInput {
  description: string;
  name: string;
  parentAgentId?: string | null;
}

export interface CompleteAgentInput {
  id: string;
}

export interface FailAgentInput {
  id: string;
}

export interface ResumeAgentInput {
  id: string;
}

export interface LaunchAgentInput {
  agentRegistryId: string;
  message: string;
}

export interface SendAgentMessageInput {
  agentId: string;
  message: string;
}

export interface ReadAgentInput {
  id: string;
}

export type AgentStatus = 'idle' | 'running' | 'waiting' | 'interrupted' | 'offline' | 'failed';
