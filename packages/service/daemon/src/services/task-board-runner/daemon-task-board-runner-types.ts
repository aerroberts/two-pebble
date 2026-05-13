import type { Logger } from '@two-pebble/logger';
import type { TaskBoardEventRecord } from '@two-pebble/pebble';
import type { DaemonBridge } from '../../types';
import type { TaskBoardService } from '../task-board-service';

export interface DaemonTaskBoardRunnerContext {
  bridge: DaemonBridge;
  logger: Logger;
  taskBoards: TaskBoardService;
}

export interface TaskEventBroadcastRecord {
  taskId: string;
}

export interface TaskBoardPoolRecord {
  id: string;
  name: string;
  parentPoolId: string | null;
}

export interface TaskBoardTaskRecord {
  id: string;
  name: string;
  description: string;
  poolId: string | null;
  status: string;
  effectiveStatus: string;
  ownerId: string | null;
}

export type DaemonTaskBoardRunnerEvent = TaskBoardEventRecord;
