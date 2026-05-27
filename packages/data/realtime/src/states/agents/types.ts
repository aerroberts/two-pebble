import type { CellContent } from '@two-pebble/pebble';
import type { AgentLaunchWorkspaceOverride } from '@two-pebble/protocol';
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
  workspaceId: string;
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
  cells?: CellContent[];
  /**
   * Document id this launch was triggered from. Drives the daemon's
   * auto-attach for `progressive-task-list` so the agent can act on
   * todos embedded in the document body.
   */
  sourceDocumentId?: string;
  workspaceOverride?: AgentLaunchWorkspaceOverride;
}

export interface SendAgentMessageInput {
  agentId: string;
  message: string;
  cells?: CellContent[];
  /**
   * Document id this message was triggered from. The daemon uses it to
   * gate the `<open-tasks>` rendering and to detect mid-life rebind
   * conflicts.
   */
  sourceDocumentId?: string;
}

export interface ReadAgentInput {
  id: string;
}

export type AgentStatus = 'idle' | 'running' | 'waiting' | 'interrupted' | 'offline' | 'failed';
