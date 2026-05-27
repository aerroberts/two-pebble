import { useEffect, useMemo } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useAutomations(input?: { projectId?: string }) {
  const datastore = useRealtimeDatastore();
  const automations = useRealtimeStore((state) => state.automations);
  const agentRegistries = useRealtimeStore((state) => state.agentRegistries);
  const projectId = input?.projectId;

  useEffect(() => {
    if (automations.status === 'idle') {
      void datastore.automations.list().catch(() => undefined);
    }
  }, [datastore, automations.status]);

  useEffect(() => {
    if (projectId !== undefined && agentRegistries.status === 'idle') {
      void datastore.agentRegistries.list().catch(() => undefined);
    }
  }, [agentRegistries.status, datastore, projectId]);

  return useMemo(() => {
    if (projectId === undefined) {
      return automations;
    }
    const registryIds = new Set(
      agentRegistries
        .values()
        .filter((registry) => registry.projectId === projectId)
        .map((registry) => registry.id),
    );
    return automations
      .withItems(automations.entries().filter((entry) => registryIds.has(entry.value.agentRegistryId)))
      .withStatus(automations.status);
  }, [agentRegistries, automations, projectId]);
}
