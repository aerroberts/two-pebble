'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useSendAssistantMessage() {
  return useRealtimeDatastore().assistant.sendMessage;
}
