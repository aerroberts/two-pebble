'use client';

import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useDocument(input: { id: string }) {
  const datastore = useRealtimeDatastore();
  const document = useRealtimeStore((state) => state.documents.getItem(input.id));

  useEffect(() => {
    if (input.id.length === 0) {
      return;
    }
    if (document === null || document.status === 'idle') {
      void datastore.documents.read({ id: input.id }).catch(() => undefined);
    }
  }, [datastore, document, input.id]);

  return document;
}
