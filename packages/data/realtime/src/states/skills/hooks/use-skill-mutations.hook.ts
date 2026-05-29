'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import type { CreateSkillInput, DeleteSkillInput, UpdateSkillInput } from '../types';

export function useSkillMutations() {
  const datastore = useRealtimeDatastore();

  return {
    createSkill: (input: CreateSkillInput) => datastore.skills.create(input),
    deleteSkill: (input: DeleteSkillInput) => datastore.skills.delete(input),
    renameSkill: (input: Pick<UpdateSkillInput, 'id' | 'name'>) => datastore.skills.update(input),
    updateSkillDescription: (input: Pick<UpdateSkillInput, 'description' | 'id'>) => datastore.skills.update(input),
    updateSkillFolder: (input: Pick<UpdateSkillInput, 'diskFolderPath' | 'id'>) => datastore.skills.update(input),
  };
}
