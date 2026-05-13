import type { LoadableRegistry } from '../../loadable';
import type { RealtimeEmitPayload, RealtimeEmitResponse } from '../../types';

export interface WorktreesState {
  worktrees: LoadableRegistry<WorktreeRecord>;
}

export type CreateWorktreeInput = RealtimeEmitPayload<'createWorktree'>;
export type DeleteWorktreeInput = RealtimeEmitPayload<'deleteWorktree'>;
export type ListWorktreesInput = RealtimeEmitPayload<'listWorktrees'>;
export type WorktreeRecord = RealtimeEmitResponse<'listWorktrees'>['items'][number];
export type WorktreeStatus = WorktreeRecord['status'];
