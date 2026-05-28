'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useDocuments(input?: { projectId?: string }) {
  const datastore = useRealtimeDatastore();
  const documents = useRealtimeStore((state) => state.documents);
  const projectId = input?.projectId;
  // The shared store may hold documents from a previously-viewed project. Track which
  // projectId we've initiated a fetch for so consumers don't show an empty state from
  // stale data before our fetch lands.
  const [fetchedProjectId, setFetchedProjectId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (projectId !== undefined) {
      if (fetchedProjectId !== projectId || documents.status === 'idle') {
        setFetchedProjectId(projectId);
        void datastore.documents.list({ limit: 200, offset: 0, projectId }).catch(() => undefined);
      }
    } else if (documents.status === 'idle') {
      void datastore.documents.list({ limit: 200, offset: 0 }).catch(() => undefined);
    }
  }, [datastore, documents.status, projectId, fetchedProjectId]);

  return useMemo(() => {
    if (projectId === undefined) {
      return documents;
    }
    const effectiveStatus = fetchedProjectId === projectId ? documents.status : 'loading';
    return documents
      .withItems(documents.entries().filter((entry) => entry.value.projectId === projectId))
      .withStatus(effectiveStatus);
  }, [documents, projectId, fetchedProjectId]);
}
