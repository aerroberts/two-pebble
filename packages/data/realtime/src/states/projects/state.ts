import { LoadableRegistry } from '../../loadable';
import type { ProjectRecord, ProjectsState } from './types';

export function createProjectsState(): ProjectsState {
  return {
    projects: new LoadableRegistry<ProjectRecord>(),
  };
}
