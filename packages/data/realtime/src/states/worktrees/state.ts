import { LoadableRegistry } from '../../loadable';
import type { WorktreeRecord, WorktreesState } from './types';

export function createWorktreesState(): WorktreesState {
  return {
    worktrees: new LoadableRegistry<WorktreeRecord>(),
  };
}
