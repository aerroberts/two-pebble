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
  status: 'idle' | 'running' | 'waiting' | 'interrupted' | 'offline' | 'failed';
}

export async function readSubAgent(datastore: Datastore, id: string) {
  try {
    return await datastore.agent.read({ id });
  } catch {
    return undefined;
  }
}

/**
 * Idempotent sub-agent record creation.
 *
 * Reads first and returns the existing record when one already exists for the
 * given id, so repeated sub-agent-invoke traces (or concurrent
 * ensureSubAgent callers that lose the in-memory pending-map race) never end
 * up with duplicate rows. Falls back to the read path again on a
 * unique-constraint error from the underlying create so we stay safe even
 * under concurrent writers we did not coordinate through `pending`.
 */
export async function createSubAgent(datastore: Datastore, input: CreateSubAgentInput): Promise<CreateSubAgentResult> {
  const existing = await readSubAgent(datastore, input.id);
  if (existing !== undefined) {
    return { created: false, id: existing.id, record: existing };
  }
  try {
    const record = await datastore.agent.create(input);
    return { created: true, id: record.id, record };
  } catch {
    const record = await datastore.agent.read({ id: input.id });
    return { created: false, id: record.id, record };
  }
}
