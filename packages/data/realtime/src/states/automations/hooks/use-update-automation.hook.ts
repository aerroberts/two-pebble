import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useUpdateAutomation() {
  return useRealtimeDatastore().automations.update;
}
