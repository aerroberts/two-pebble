import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useSendAgentMessage() {
  return useRealtimeDatastore().agent.sendMessage;
}
