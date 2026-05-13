import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';

export function useRecordAgentPriceLineItem() {
  return useRealtimeDatastore().agent.priceLineItems.record;
}
