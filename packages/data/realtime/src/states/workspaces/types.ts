import type { LoadableRegistry } from '../../loadable';
import type { RealtimeEmitResponse } from '../../types';

export interface WorkspacesState {
  workspaces: LoadableRegistry<WorkspaceRecord>;
}

export type WorkspaceRecord = RealtimeEmitResponse<'listWorkspaces'>['items'][number];
