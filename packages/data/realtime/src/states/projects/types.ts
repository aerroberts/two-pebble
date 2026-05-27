import type { LoadableRegistry } from '../../loadable';
import type { RealtimeEmitPayload, RealtimeEmitResponse } from '../../types';

export interface ProjectsState {
  projects: LoadableRegistry<ProjectRecord>;
}

export type ProjectRecord = RealtimeEmitResponse<'listProjects'>['items'][number];
export type CreateProjectInput = RealtimeEmitPayload<'createProject'>;
export type UpdateProjectInput = RealtimeEmitPayload<'updateProject'>;
export type DeleteProjectInput = RealtimeEmitPayload<'deleteProject'>;
