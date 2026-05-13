import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useCreateAgent() {
  return useRealtimeDatastore().agent.create;
}
