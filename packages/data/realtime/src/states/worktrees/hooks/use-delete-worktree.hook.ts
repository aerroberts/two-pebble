'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useDeleteWorktree() {
  return useRealtimeDatastore().worktrees.delete;
}
