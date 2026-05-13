import type { TaskBoardPoolNode, TaskBoardTaskNode } from '../../agent';

export type PoolChildrenByParent = Map<string | null, TaskBoardPoolNode[]>;

export type TasksByPool = Map<string | null, TaskBoardTaskNode[]>;

export type DependenciesBySource = Map<string, string[]>;

export interface RenderPoolInput {
  depsByFrom: DependenciesBySource;
  isLast: boolean;
  out: string[];
  pool: TaskBoardPoolNode;
  poolsByParent: PoolChildrenByParent;
  prefix: string;
  tasksByPool: TasksByPool;
}
