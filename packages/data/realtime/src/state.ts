import { createAgentCallsState } from './states/agent-calls/state';
import type { AgentCallsState } from './states/agent-calls/types';
import { createAgentLivenessState } from './states/agent-liveness/state';
import type { AgentLivenessState } from './states/agent-liveness/types';
import { createAgentPriceLineItemsState } from './states/agent-price-line-items/state';
import type { AgentPriceLineItemsState } from './states/agent-price-line-items/types';
import { createAgentRegistriesState } from './states/agent-registries/state';
import type { AgentRegistriesState } from './states/agent-registries/types';
import { createAgentTracesState } from './states/agent-traces/state';
import type { AgentTracesState } from './states/agent-traces/types';
import { createAgentsState } from './states/agents/state';
import type { AgentsState } from './states/agents/types';
import { createAppSettingsState } from './states/app-settings/state';
import type { AppSettingsState } from './states/app-settings/types';
import { createDebugLogsState } from './states/debug-logs/state';
import type { DebugLogsState } from './states/debug-logs/types';
import { createInferenceProfilesState } from './states/inference-profiles/state';
import type { InferenceProfilesState } from './states/inference-profiles/types';
import { createIntegrationsState } from './states/integrations/state';
import type { IntegrationsState } from './states/integrations/types';
import { createRepositoriesState } from './states/repositories/state';
import type { RepositoriesState } from './states/repositories/types';
import { createTasksState } from './states/tasks/state';
import type { TasksState } from './states/tasks/types';
import { createThirdPartyAgentInstallsState } from './states/third-party-agent-installs/state';
import type { ThirdPartyAgentInstallsState } from './states/third-party-agent-installs/types';
import { createWorkspacesState } from './states/workspaces/state';
import type { WorkspacesState } from './states/workspaces/types';
import { createWorktreesState } from './states/worktrees/state';
import type { WorktreesState } from './states/worktrees/types';

export interface RealtimeState
  extends AgentCallsState,
    AgentLivenessState,
    AgentPriceLineItemsState,
    AgentRegistriesState,
    AgentTracesState,
    AgentsState,
    AppSettingsState,
    InferenceProfilesState,
    IntegrationsState,
    RepositoriesState,
    TasksState,
    ThirdPartyAgentInstallsState,
    WorkspacesState,
    WorktreesState,
    DebugLogsState {}

export function createRealtimeState(): RealtimeState {
  return {
    ...createAgentCallsState(),
    ...createAgentLivenessState(),
    ...createAgentPriceLineItemsState(),
    ...createAgentRegistriesState(),
    ...createAgentTracesState(),
    ...createAgentsState(),
    ...createAppSettingsState(),
    ...createDebugLogsState(),
    ...createInferenceProfilesState(),
    ...createIntegrationsState(),
    ...createRepositoriesState(),
    ...createTasksState(),
    ...createThirdPartyAgentInstallsState(),
    ...createWorkspacesState(),
    ...createWorktreesState(),
  };
}
