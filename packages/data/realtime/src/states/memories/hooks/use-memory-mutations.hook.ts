'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import type { CreateMemoryInput, DeleteMemoryInput } from '../types';

export function useMemoryMutations() {
  const datastore = useRealtimeDatastore();

  return {
    createMemory: (input: CreateMemoryInput) => datastore.memories.create(input),
    deleteMemory: (input: DeleteMemoryInput) => datastore.memories.delete(input),
  };
}
