import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useDeleteAutomation() {
  return useRealtimeDatastore().automations.delete;
}
