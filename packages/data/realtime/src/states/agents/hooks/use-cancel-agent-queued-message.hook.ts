import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useCancelAgentQueuedMessage() {
  return useRealtimeDatastore().agent.queuedMessages.cancel;
}
