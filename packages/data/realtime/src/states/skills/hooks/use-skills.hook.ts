'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useSkills(input?: { projectId?: string }) {
  const datastore = useRealtimeDatastore();
  const skills = useRealtimeStore((state) => state.skills);
  const projectId = input?.projectId;
  // The shared store may hold skills from a previously-viewed project. Track which
  // projectId we've initiated a fetch for so consumers don't show an empty state from
  // stale data before our fetch lands.
  const [fetchedProjectId, setFetchedProjectId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (projectId !== undefined) {
      if (fetchedProjectId !== projectId || skills.status === 'idle') {
        setFetchedProjectId(projectId);
        void datastore.skills.list({ limit: 200, offset: 0, projectId }).catch(() => undefined);
      }
    } else if (skills.status === 'idle') {
      void datastore.skills.list({ limit: 200, offset: 0 }).catch(() => undefined);
    }
  }, [datastore, skills.status, projectId, fetchedProjectId]);

  return useMemo(() => {
    if (projectId === undefined) {
      return skills;
    }
    const effectiveStatus = fetchedProjectId === projectId ? skills.status : 'loading';
    return skills
      .withItems(skills.entries().filter((entry) => entry.value.projectId === projectId))
      .withStatus(effectiveStatus);
  }, [skills, projectId, fetchedProjectId]);
}
