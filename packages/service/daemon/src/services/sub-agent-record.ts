import type { Datastore } from '@two-pebble/datastore';

export interface CreateSubAgentInput {
  description: string;
  id: string;
  name: string;
  parentAgentId: string;
  workspaceId: string;
}

export interface CreateSubAgentResult {
  created: boolean;
  id: string;
  record: SubAgentRecord;
}

export interface SubAgentRecord {
  agentRegistryId?: string | null;
  completedAt: number;
  description: string;
  id: string;
  metadata: string;
  name: string;
  parentAgentId?: string | null;
  startedAt: number;
  status: 'idle' | 'running' | 'waiting' | 'offline' | 'failed';
}

export async function readSubAgent(datastore: Datastore, id: string) {
  try {
    return await datastore.agent.read({ id });
  } catch {
    return undefined;
  }
}

export async function createSubAgent(datastore: Datastore, input: CreateSubAgentInput): Promise<CreateSubAgentResult> {
  try {
    const record = await datastore.agent.create(input);
    return { created: true, id: record.id, record };
  } catch {
    const record = await datastore.agent.read({ id: input.id });
    return { created: false, id: record.id, record };
  }
}
