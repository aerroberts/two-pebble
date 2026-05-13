'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useOpenWorktree() {
  return useRealtimeDatastore().worktrees.open;
}
