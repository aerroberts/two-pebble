export type { WorkspaceConfig_Absolute } from './absolute';
export type { WorkspaceConfig_None } from './none';
export type { WorkspaceConfig_Worktree } from './worktree';

import type { WorkspaceConfig_Absolute } from './absolute';
import type { WorkspaceConfig_None } from './none';
import type { WorkspaceConfig_Worktree } from './worktree';

export type WorkspaceConfig = WorkspaceConfig_Absolute | WorkspaceConfig_None | WorkspaceConfig_Worktree;
export type WorkspaceConfigKind = WorkspaceConfig['kind'];
export type AgentRegistryWorkspaceConfig = WorkspaceConfig;
