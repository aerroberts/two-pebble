import type { Datastore } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type { DaemonBridge } from '../../types';
import type { AgentRegistryService } from '../agent-registry-service';
import type { TaskBoardService } from '../task-board-service';
import type { DispatchTaskRecord } from './types';

export interface DispatchTaskInput {
  agentRegistry: AgentRegistryService;
  bridge: DaemonBridge;
  datastore: Datastore;
  logger: Logger;
  registryId: string;
  task: DispatchTaskRecord;
  taskBoards: TaskBoardService;
}

export async function dispatchTask(input: DispatchTaskInput): Promise<void> {
  const registry = await input.datastore.agentRegistries.read({ id: input.registryId });
  const launched = await input.agentRegistry.launch({
    agentRegistryId: input.registryId,
    message: 'Please complete the assigned task.',
    extraCapabilities: [
      {
        id: 'task-lifecycle',
        config: {
          taskId: input.task.id,
          boardId: input.task.boardId,
          taskName: input.task.name,
          taskDescription: input.task.description,
        },
      },
    ],
  });
  const trace = await input.datastore.agent.traces.record({
    agentId: launched.id,
    data: {
      taskId: input.task.id,
      taskName: input.task.name,
      taskDescription: input.task.description,
      boardId: input.task.boardId,
    },
    id: crypto.randomUUID(),
    orderId: 0,
    type: 'task-assigned',
  });
  input.bridge.emit('agentTraceRecorded', trace);
  await input.taskBoards.setTaskOwner(input.task.id, launched.id);
  const delegation = await input.taskBoards.recordDelegationEvent({
    taskId: input.task.id,
    agentId: launched.id,
    agentRegistryId: input.registryId,
    agentName: registry.name,
    reason: `auto: dispatched to ${registry.name}`,
  });
  input.bridge.emit('taskEventRecorded', delegation);
  const status = await input.taskBoards.setTaskStatus(input.task.boardId, {
    id: input.task.id,
    status: 'working',
    reason: `auto: dispatched to ${registry.name}`,
  });
  for (const event of status.events) {
    input.bridge.emit('taskEventRecorded', event);
  }
  input.bridge.emit('taskUpdated', status.result);
  input.logger.info('task auto-dispatched', {
    taskId: input.task.id,
    agentId: launched.id,
    registryId: input.registryId,
  });
}
