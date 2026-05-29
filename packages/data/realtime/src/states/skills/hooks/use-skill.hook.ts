'use client';

import { useEffect } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';

export function useSkill(input: { id: string }) {
  const datastore = useRealtimeDatastore();
  const skill = useRealtimeStore((state) => state.skills.getItem(input.id));

  useEffect(() => {
    if (input.id.length === 0) {
      return;
    }
    if (skill === null || skill.status === 'idle') {
      void datastore.skills.read({ id: input.id }).catch(() => undefined);
    }
  }, [datastore, skill, input.id]);

  return skill;
}
