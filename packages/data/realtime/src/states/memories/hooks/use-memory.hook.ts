'use client';

import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useMemory(input: { id: string }) {
  const datastore = useRealtimeDatastore();
  const memory = useRealtimeStore((state) => state.memories.getItem(input.id));

  useEffect(() => {
    if (input.id.length === 0) {
      return;
    }
    if (memory === null || memory.status === 'idle') {
      void datastore.memories.read({ id: input.id }).catch(() => undefined);
    }
  }, [datastore, memory, input.id]);

  return memory;
}
