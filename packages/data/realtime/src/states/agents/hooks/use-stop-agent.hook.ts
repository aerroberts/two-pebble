import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useStopAgent() {
  return useRealtimeDatastore().agent.stop;
}
