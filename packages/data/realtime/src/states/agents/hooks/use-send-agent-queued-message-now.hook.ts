import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useSendAgentQueuedMessageNow() {
  return useRealtimeDatastore().agent.queuedMessages.sendNow;
}
