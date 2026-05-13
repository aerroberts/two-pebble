'use client';

import { useStore } from 'zustand';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import type { RealtimeState } from '../../../state';
import type { RealtimeSelector } from '../../../types';

export function useRealtimeStore<TValue>(selector: RealtimeSelector<RealtimeState, TValue>) {
  const datastore = useRealtimeDatastore();
  return useStore(datastore.store, selector);
}
