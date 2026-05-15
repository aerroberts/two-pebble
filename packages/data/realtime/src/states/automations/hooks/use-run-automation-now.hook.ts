import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useRunAutomationNow() {
  return useRealtimeDatastore().automations.runNow;
}
