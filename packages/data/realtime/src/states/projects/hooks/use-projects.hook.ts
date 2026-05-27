'use client';

import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useProjects() {
  const datastore = useRealtimeDatastore();
  const projects = useRealtimeStore((state) => state.projects);

  useEffect(() => {
    if (projects.status === 'idle') {
      void datastore.projects.list().catch(() => undefined);
    }
  }, [datastore, projects.status]);

  return projects;
}
