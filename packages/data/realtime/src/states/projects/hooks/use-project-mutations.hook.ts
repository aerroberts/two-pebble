'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import type { CreateProjectInput, DeleteProjectInput, UpdateProjectInput } from '../types';

export function useProjectMutations() {
  const datastore = useRealtimeDatastore();
  return {
    createProject: (input: CreateProjectInput) => datastore.projects.create(input),
    deleteProject: (input: DeleteProjectInput) => datastore.projects.delete(input),
    updateProject: (input: UpdateProjectInput) => datastore.projects.update(input),
  };
}
