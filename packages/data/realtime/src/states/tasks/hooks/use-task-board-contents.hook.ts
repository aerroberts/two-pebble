'use client';

import { useEffect, useMemo } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

interface UseTaskBoardContentsInput {
  boardId: string;
}

/**
 * Loads + selects the pools, tasks, and dependencies that belong to one board.
 * Triggers list operations on first mount and filters the global registries
 * down to entries that match the board id.
 */
export function useTaskBoardContents(input: UseTaskBoardContentsInput) {
  const datastore = useRealtimeDatastore();
  const allPools = useRealtimeStore((state) => state.taskPools);
  const allTasks = useRealtimeStore((state) => state.tasks);
  const allDeps = useRealtimeStore((state) => state.taskDependencies);

  useEffect(() => {
    if (input.boardId.length === 0) return;
    void datastore.taskPools.list({ boardId: input.boardId }).catch(() => undefined);
    void datastore.tasks.list({ boardId: input.boardId }).catch(() => undefined);
    void datastore.taskDependencies.list({ boardId: input.boardId }).catch(() => undefined);
  }, [datastore, input.boardId]);

  const pools = useMemo(
    () => allPools.values().filter((pool) => pool.boardId === input.boardId),
    [allPools, input.boardId],
  );
  const tasks = useMemo(
    () => allTasks.values().filter((task) => task.boardId === input.boardId),
    [allTasks, input.boardId],
  );
  const dependencies = useMemo(
    () => allDeps.values().filter((edge) => edge.boardId === input.boardId),
    [allDeps, input.boardId],
  );

  return { pools, tasks, dependencies };
}
