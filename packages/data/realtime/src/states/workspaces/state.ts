import { LoadableRegistry } from '../../loadable';
import type { WorkspaceRecord, WorkspacesState } from './types';

export function createWorkspacesState(): WorkspacesState {
  return {
    workspaces: new LoadableRegistry<WorkspaceRecord>(),
  };
}
