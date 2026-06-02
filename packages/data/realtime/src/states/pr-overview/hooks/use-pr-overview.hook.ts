'use client';

import { useEffect, useMemo } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

/**
 * Live board→task PR overview for the overview page. Fetches the daemon's
 * read-model once on mount; `listenToPrOverview` keeps it current by refetching
 * on task / tracked-PR push events. Returns the boards in stable order.
 */
export function usePrOverview(input?: { projectId?: string }) {
  const datastore = useRealtimeDatastore();
  const projectId = input?.projectId;
  const prOverview = useRealtimeStore((state) => state.prOverview);

  useEffect(() => {
    void datastore.prOverview.list(projectId === undefined ? {} : { projectId }).catch(() => undefined);
  }, [datastore, projectId]);

  const boards = useMemo(
    () => prOverview.values().sort((left, right) => left.boardName.localeCompare(right.boardName)),
    [prOverview],
  );

  return { boards, status: prOverview.status };
}
