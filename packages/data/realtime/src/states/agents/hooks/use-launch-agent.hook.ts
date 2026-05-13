import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useLaunchAgent() {
  return useRealtimeDatastore().agent.launch;
}
