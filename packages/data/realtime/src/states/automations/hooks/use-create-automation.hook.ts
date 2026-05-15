import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useCreateAutomation() {
  return useRealtimeDatastore().automations.create;
}
