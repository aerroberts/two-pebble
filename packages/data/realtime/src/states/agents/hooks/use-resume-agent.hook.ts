import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useResumeAgent() {
  return useRealtimeDatastore().agent.resume;
}
