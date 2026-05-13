import type { Datastore } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type { Agent, PebbleJsonRecord } from '@two-pebble/pebble';
import type { DaemonBridge } from '../types';
import type { PersistAgentStatusInput } from './agent-registry-types';
import type { TaskBoardService } from './task-board-service';

interface HydrateZombiesInput {
  datastore: Datastore;
  logger: Logger;
}

/**
 * Resets any 'running' agents left behind by a prior daemon process to 'idle'.
 * Without this the UI lies about state and the next daemon process has no
 * way to know which agents really are alive.
 */
export async function hydrateAgentZombies(input: HydrateZombiesInput): Promise<void> {
  const { items } = await input.datastore.agent.list({ limit: 1000, offset: 0 });
  const zombies = items.filter((row) => row.status === 'running');
  for (const zombie of zombies) {
    await input.datastore.agent.setStatus({ id: zombie.id, status: 'idle' }).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      input.logger.warn('agent zombie reset failed', { agentId: zombie.id, error: message });
    });
  }
  input.logger.info('agent zombies reset', { count: zombies.length });
}

interface PersistStatusInput extends PersistAgentStatusInput {
  datastore: Datastore;
  logger: Logger;
  activeAgents: Map<string, Agent>;
  taskBoards: TaskBoardService;
}

/**
 * Persists a runtime agent's status change and broadcasts it.
 * Terminal statuses evict the agent from activeAgents so dead instances
 * don't accumulate across long-running daemons, and propagate the terminal
 * state to any task the agent owns so task lifecycle mirrors the delegate's.
 */
export async function persistAgentStatus(input: PersistStatusInput): Promise<void> {
  if (input.status === 'failed' || input.status === 'offline') {
    input.activeAgents.delete(input.agentId);
  }
  let updatedName: string | undefined;
  try {
    const updated = await input.datastore.agent.setStatus({ id: input.agentId, status: input.status });
    updatedName = updated.name;
    input.bridge.emit('agentRecorded', updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    input.logger.warn('agent status write failed', { agentId: input.agentId, error: message });
    return;
  }
  if (input.status !== 'failed') {
    return;
  }
  try {
    const sync = await input.taskBoards.syncOwnedTasksFromAgentStatus({
      agentId: input.agentId,
      agentStatus: input.status,
      reason: `auto: agent ${updatedName ?? input.agentId} ${input.status}`,
    });
    for (const event of sync.events) {
      input.bridge.emit('taskEventRecorded', event);
    }
    for (const task of sync.tasks) {
      input.bridge.emit('taskUpdated', task);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    input.logger.warn('task status sync from agent failed', { agentId: input.agentId, error: message });
  }
}

interface PersistMetadataInput {
  agentId: string;
  bridge: DaemonBridge;
  datastore: Datastore;
  logger: Logger;
  metadata: PebbleJsonRecord;
}

/**
 * Persists a framework metadata snapshot under the durable agent record.
 * Each snapshot replaces the previous blob; the adapter is responsible for
 * publishing a complete shape on every update.
 */
export async function persistAgentMetadata(input: PersistMetadataInput): Promise<void> {
  try {
    const updated = await input.datastore.agent.setMetadata({
      id: input.agentId,
      metadata: JSON.stringify(input.metadata),
    });
    input.bridge.emit('agentRecorded', updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    input.logger.warn('agent metadata write failed', { agentId: input.agentId, error: message });
  }
}
