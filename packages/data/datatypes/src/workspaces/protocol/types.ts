import type { WorkspaceConfig_Absolute } from './absolute';
import type { WorkspaceConfig_None } from './none';
import type { WorkspaceConfig_Worktree } from './worktree';

export type { WorkspaceConfig_Absolute, WorkspaceConfig_None, WorkspaceConfig_Worktree };

export type WorkspaceConfig = WorkspaceConfig_Absolute | WorkspaceConfig_None | WorkspaceConfig_Worktree;

export type WorkspaceConfigKind = WorkspaceConfig['kind'];

export type AgentRegistryWorkspaceConfig = WorkspaceConfig;
