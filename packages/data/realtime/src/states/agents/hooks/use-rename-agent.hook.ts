import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useRenameAgent() {
  return useRealtimeDatastore().agent.rename;
}
