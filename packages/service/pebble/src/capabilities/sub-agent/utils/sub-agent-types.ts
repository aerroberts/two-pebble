import type { SubAgentRuntime } from '../../../bridge';
import type { PebbleJsonRecord } from '../../../types';

/**
 * Where a child sits in the parent's view of it. The capability mirrors
 * signal transitions into this label so the per-turn status cell can
 * tell the model whether the child is actively producing a reply, has
 * already finished, is waiting on us, or has been stopped.
 */
export type ChildLifecycle = 'completed' | 'failed' | 'killed' | 'running' | 'waiting-for-parent';

export type ChildMode = 'task' | 'teammate';

export type ChildResultStatus = 'failure' | 'response' | 'success';

export interface ChildRecord {
  agentId: string;
  childResponseSignalId?: string | undefined;
  lifecycle: ChildLifecycle;
  mode: ChildMode;
  name: string;
  pendingWaitSignalId?: string | undefined;
  resultMessage?: string | undefined;
  resultStatus?: ChildResultStatus | undefined;
  runtime: SubAgentRuntime;
  subAgentId: string;
}

export interface SpawnSubAgentInput {
  instructions: string;
  mode: ChildMode;
  name: string;
  subAgentId: string;
}

export interface SendAgentInput {
  instructions: string;
  name: string;
}

export interface WaitForAgentsInput {
  names: string[];
}

export interface SubAgentCapabilityConfig {
  agents?: SubAgentReference[];
}

export interface SubAgentReference {
  agentRegistryId: string;
  description?: string;
  name: string;
}

export interface ParentSignalInput {
  childAgentId: string;
  data: PebbleJsonRecord;
  description: string;
  name: string;
}
