'use client';

import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useDocuments() {
  const datastore = useRealtimeDatastore();
  const documents = useRealtimeStore((state) => state.documents);

  useEffect(() => {
    if (documents.status === 'idle') {
      void datastore.documents.list({ limit: 200, offset: 0 }).catch(() => undefined);
    }
  }, [datastore, documents.status]);

  return documents;
}
