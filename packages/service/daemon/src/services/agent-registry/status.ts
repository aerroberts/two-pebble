import type { Datastore } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type { Agent, PebbleJsonRecord } from '@two-pebble/pebble';
import type { DaemonEventSink } from '../../types';
import type { TaskBoardService } from '../task-board/service';
import type { PersistAgentStatusInput } from './types';

interface InterruptStaleRunningAgentsInput {
  datastore: Datastore;
  logger: Logger;
}

/**
 * Marks any 'running' agents left behind by a prior daemon process as
 * interrupted. Runtime agent objects do not survive daemon restart, so these
 * rows cannot honestly remain running and should not auto-resume from signals.
 */
export async function interruptStaleRunningAgents(input: InterruptStaleRunningAgentsInput): Promise<void> {
  const { items } = await input.datastore.agent.list({ limit: 1000, offset: 0 });
  const interrupted = items.filter((row) => row.status === 'running');
  for (const agent of interrupted) {
    await input.datastore.agent.setStatus({ id: agent.id, status: 'interrupted' }).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      input.logger.warn('agent interrupt audit failed', { agentId: agent.id, error: message });
    });
  }
  input.logger.info('agent interrupt audit complete', { count: interrupted.length });
}

interface PersistStatusInput extends PersistAgentStatusInput {
  datastore: Datastore;
  logger: Logger;
  activeAgents: Map<string, Agent>;
  taskBoards: TaskBoardService;
  /**
   * Optional hook called after the new status row is persisted. Used by
   * the registry service to fan the change out to in-process subscribers
   * such as the task dispatcher.
   */
  onStatusPersisted?: (agentId: string, status: PersistAgentStatusInput['status']) => void;
}

/**
 * Persists a runtime agent's status change and broadcasts it.
 * Only running agents stay in the active runtime registry. Waiting, idle,
 * interrupted, and terminal statuses are durable states, not hot daemon state.
 */
export async function persistAgentStatus(input: PersistStatusInput): Promise<void> {
  if (input.status !== 'running') {
    input.activeAgents.delete(input.agentId);
  }
  let updatedName: string | undefined;
  try {
    const updated = await input.datastore.agent.setStatus({ id: input.agentId, status: input.status });
    updatedName = updated.name;
    input.events.emit('agentRecorded', updated);
    input.onStatusPersisted?.(input.agentId, input.status);
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
      input.events.emit('taskEventRecorded', event);
    }
    for (const task of sync.tasks) {
      input.events.emit('taskUpdated', task);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    input.logger.warn('task status sync from agent failed', { agentId: input.agentId, error: message });
  }
}

interface PersistMetadataInput {
  agentId: string;
  datastore: Datastore;
  events: DaemonEventSink;
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
    input.events.emit('agentRecorded', updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    input.logger.warn('agent metadata write failed', { agentId: input.agentId, error: message });
  }
}
