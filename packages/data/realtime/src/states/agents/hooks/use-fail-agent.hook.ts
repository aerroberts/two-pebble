import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useFailAgent() {
  return useRealtimeDatastore().agent.fail;
}
