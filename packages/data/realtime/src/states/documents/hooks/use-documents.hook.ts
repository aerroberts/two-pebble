'use client';

import { useEffect, useMemo } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useDocuments(input?: { projectId?: string }) {
  const datastore = useRealtimeDatastore();
  const documents = useRealtimeStore((state) => state.documents);
  const projectId = input?.projectId;

  useEffect(() => {
    if (projectId !== undefined) {
      void datastore.documents.list({ limit: 200, offset: 0, projectId }).catch(() => undefined);
    } else if (documents.status === 'idle') {
      void datastore.documents.list({ limit: 200, offset: 0 }).catch(() => undefined);
    }
  }, [datastore, documents.status, projectId]);

  return useMemo(() => {
    if (projectId === undefined) {
      return documents;
    }
    return documents
      .withItems(documents.entries().filter((entry) => entry.value.projectId === projectId))
      .withStatus(documents.status);
  }, [documents, projectId]);
}
