import type { LoadableRegistry } from '../../loadable';
import type { RealtimeEmitPayload, RealtimeEmitResponse } from '../../types';

export interface RepositoriesState {
  repositories: LoadableRegistry<RepositoryRecord>;
}

export type CreateRepositoryInput = RealtimeEmitPayload<'createRepository'>;
export type CreateRepositoryResponse = RealtimeEmitResponse<'createRepository'>;
export type UpdateRepositoryInput = RealtimeEmitPayload<'updateRepository'>;
export type DeleteRepositoryInput = RealtimeEmitPayload<'deleteRepository'>;
export type RepositoryRecord = RealtimeEmitResponse<'listRepositories'>['items'][number];
