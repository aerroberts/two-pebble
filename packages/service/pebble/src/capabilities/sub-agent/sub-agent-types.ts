import type { PebbleJsonRecord } from '../../types';

export interface ChildRecord {
  agentId: string;
  referenceName: string;
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
