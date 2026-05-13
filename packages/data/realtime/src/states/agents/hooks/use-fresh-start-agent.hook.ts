import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useFreshStartAgent() {
  return useRealtimeDatastore().agent.freshStart;
}
