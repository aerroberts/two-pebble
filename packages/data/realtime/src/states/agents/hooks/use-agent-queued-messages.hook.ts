'use client';

import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useAgentQueuedMessages(input: { agentId: string }) {
  const datastore = useRealtimeDatastore();
  const queuedMessages = useRealtimeStore((state) => state.agentQueuedMessages);

  useEffect(() => {
    if (input.agentId.length > 0) {
      void datastore.agent.queuedMessages.list({ agentId: input.agentId }).catch(() => undefined);
    }
  }, [input.agentId, datastore]);

  return queuedMessages;
}
