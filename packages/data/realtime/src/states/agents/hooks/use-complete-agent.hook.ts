import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useCompleteAgent() {
  return useRealtimeDatastore().agent.complete;
}
