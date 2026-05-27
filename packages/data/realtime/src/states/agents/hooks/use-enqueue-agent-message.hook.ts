import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useEnqueueAgentMessage() {
  return useRealtimeDatastore().agent.queuedMessages.enqueue;
}
