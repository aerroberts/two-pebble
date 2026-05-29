import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

/**
 * Returns all automations. Automations reference a global agent registry and are
 * themselves global; the optional `projectId` is accepted for call-site
 * compatibility but no longer scopes the result.
 */
export function useAutomations(_input?: { projectId?: string }) {
  const datastore = useRealtimeDatastore();
  const automations = useRealtimeStore((state) => state.automations);

  useEffect(() => {
    if (automations.status === 'idle') {
      void datastore.automations.list().catch(() => undefined);
    }
  }, [datastore, automations.status]);

  return automations;
}
