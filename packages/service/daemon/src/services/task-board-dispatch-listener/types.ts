import type { Datastore, TaskDispatchScopeKind } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type { ProtocolTaskRecord } from '@two-pebble/protocol';
import type { DaemonBridge } from '../../types';
import type { AgentRegistryService } from '../agent-registry-service';
import type { HeartbeatService } from '../heartbeat-service';
import type { TaskBoardService } from '../task-board-service';

export interface TaskBoardDispatchServiceInput {
  agentRegistry: AgentRegistryService;
  bridge: DaemonBridge;
  datastore: Datastore;
  heartbeat: HeartbeatService;
  logger: Logger;
  taskBoards: TaskBoardService;
}

export interface DispatcherScope {
  kind: TaskDispatchScopeKind;
  id: string;
}

export type DispatchTaskRecord = ProtocolTaskRecord;
