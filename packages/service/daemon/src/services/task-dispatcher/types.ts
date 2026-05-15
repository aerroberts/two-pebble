import type { Datastore, TaskDispatchScopeKind } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type { DaemonBridge } from '../../types';
import type { AgentRegistryService } from '../agent-registry-service';
import type { TaskBoardService } from '../task-board-service';

export interface TaskDispatcherServiceContext {
  agentRegistry: AgentRegistryService;
  bridge: DaemonBridge;
  datastore: Datastore;
  logger: Logger;
  taskBoards: TaskBoardService;
}

export interface DispatcherScope {
  kind: TaskDispatchScopeKind;
  id: string;
}
