import { LoadableRegistry } from '../../loadable';
import type { RepositoriesState, RepositoryRecord } from './types';

export function createRepositoriesState(): RepositoriesState {
  return {
    repositories: new LoadableRegistry<RepositoryRecord>(),
  };
}
