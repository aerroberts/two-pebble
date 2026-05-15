import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useAutomations() {
  const datastore = useRealtimeDatastore();
  const automations = useRealtimeStore((state) => state.automations);

  useEffect(() => {
    if (automations.status === 'idle') {
      void datastore.automations.list().catch(() => undefined);
    }
  }, [datastore, automations.status]);

  return automations;
}
