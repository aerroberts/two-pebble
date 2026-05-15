import type { PebbleJsonRecord } from '../../types';

/**
 * Where a child sits in the parent's view of it. The capability mirrors
 * signal transitions into this label so the per-turn status cell can
 * tell the model whether the child is actively producing a reply, has
 * already finished, is waiting on us, or has been stopped.
 */
export type ChildLifecycle = 'awaiting-reply' | 'idle-after-reply' | 'awaiting-our-response' | 'killed';

export interface ChildRecord {
  agentId: string;
  referenceName: string;
  lifecycle: ChildLifecycle;
  responseSignalId?: string;
}

export interface PendingChildQuestion {
  childAgentId: string;
  continueAfterResponse?: boolean;
  responseSignalId: string;
}

export interface SubAgentReference {
  agentRegistryId: string;
  description?: string;
  name: string;
}

export interface SubAgentCapabilityConfig {
  agents?: SubAgentReference[];
}

export interface ParentSignalInput {
  childAgentId: string;
  data: PebbleJsonRecord;
  description: string;
  name: string;
}
