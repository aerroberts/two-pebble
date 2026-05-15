import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useHeartbeats() {
  const datastore = useRealtimeDatastore();
  const heartbeats = useRealtimeStore((state) => state.heartbeats);

  useEffect(() => {
    if (heartbeats.status === 'idle') {
      void datastore.heartbeats.list().catch(() => undefined);
    }
  }, [datastore, heartbeats.status]);

  return heartbeats;
}
