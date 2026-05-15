import type { BridgeProtocol } from '@two-pebble/ws-bridge';
import type { AgentCallsListOperation } from './protocol/agent.calls.list';
import type { AgentCallsReadOperation } from './protocol/agent.calls.read';
import type { AgentCallsRecordOperation } from './protocol/agent.calls.record';
import type { AgentCallRecordedEvent } from './protocol/agent.calls.recorded';
import type { AgentCompleteOperation } from './protocol/agent.complete';
import type { AgentCreateOperation } from './protocol/agent.create';
import type { AgentFailOperation } from './protocol/agent.fail';
import type { AgentFreshStartOperation } from './protocol/agent.fresh-start';
import type { AgentLaunchOperation } from './protocol/agent.launch';
import type { AgentListOperation } from './protocol/agent.list';
import type { AgentLivenessEvent } from './protocol/agent.liveness';
import type { AgentMessageOperation } from './protocol/agent.message';
import type { AgentPriceLineItemsListOperation } from './protocol/agent.price-line-items.list';
import type { AgentPriceLineItemsRecordOperation } from './protocol/agent.price-line-items.record';
import type { AgentPriceLineItemRecordedEvent } from './protocol/agent.price-line-items.recorded';
import type { AgentReadOperation } from './protocol/agent.read';
import type { AgentRecordedEvent } from './protocol/agent.recorded';
import type { AgentRenameOperation } from './protocol/agent.rename';
import type { AgentSignalsListOperation } from './protocol/agent.signals.list';
import type { AgentSignalsResolveOperation } from './protocol/agent.signals.resolve';
import type { AgentSignalsSendOperation } from './protocol/agent.signals.send';
import type { AgentStopOperation } from './protocol/agent.stop';
import type { AgentToolCallOperation } from './protocol/agent.tool.call';
import type { AgentTracesListOperation } from './protocol/agent.traces.list';
import type { AgentTracesRecordOperation } from './protocol/agent.traces.record';
import type { AgentTraceRecordedEvent } from './protocol/agent.traces.recorded';
import type { AgentRegistriesCreateOperation } from './protocol/agent-registries.create';
import type { AgentRegistriesDeleteOperation } from './protocol/agent-registries.delete';
import type { AgentRegistriesDeletedEvent } from './protocol/agent-registries.deleted';
import type { AgentRegistriesListOperation } from './protocol/agent-registries.list';
import type { AgentRegistriesUpdateOperation } from './protocol/agent-registries.update';
import type { AgentRegistriesUpdatedEvent } from './protocol/agent-registries.updated';
import type { AppSettingsReadOperation } from './protocol/app-settings.read';
import type { AppSettingsUpdateOperation } from './protocol/app-settings.update';
import type { AppSettingsUpdatedEvent } from './protocol/app-settings.updated';
import type { DaemonStatusOperation } from './protocol/daemon.status';
import type { DatabaseDescribeOperation } from './protocol/database.describe';
import type { DatabaseMigrateOperation } from './protocol/database.migrate';
import type { DatabaseOpenOperation } from './protocol/database.open';
import type { DatabaseRunQueryOperation } from './protocol/database.query';
import type { DebugLogsListOperation } from './protocol/debug.logs.list';
import type { DebugLogsOpenOperation } from './protocol/debug.logs.open';
import type { DebugLogsOpenDirectoryOperation } from './protocol/debug.logs.open-directory';
import type { DebugLogsReadOperation } from './protocol/debug.logs.read';
import type { DebugLogUpdatedEvent } from './protocol/debug.logs.updated';
import type { GenerateSpeechOperation } from './protocol/generate-speech';
import type { InferenceProfilesCreateOperation } from './protocol/inference-profiles.create';
import type { InferenceProfilesDeleteOperation } from './protocol/inference-profiles.delete';
import type { InferenceProfilesDeletedEvent } from './protocol/inference-profiles.deleted';
import type { InferenceProfilesListOperation } from './protocol/inference-profiles.list';
import type { InferenceProfilesUpdateOperation } from './protocol/inference-profiles.update';
import type { InferenceProfilesUpdatedEvent } from './protocol/inference-profiles.updated';
import type { IntegrationsCreateOperation } from './protocol/integrations.create';
import type { IntegrationsDeleteOperation } from './protocol/integrations.delete';
import type { IntegrationsDeletedEvent } from './protocol/integrations.deleted';
import type { IntegrationsListOperation } from './protocol/integrations.list';
import type { IntegrationsUpdateOperation } from './protocol/integrations.update';
import type { IntegrationsUpdatedEvent } from './protocol/integrations.updated';
import type { MetricsListNamesOperation } from './protocol/metrics.list-names';
import type { MetricsListVariantsOperation } from './protocol/metrics.list-variants';
import type { MetricsQueryAggregatedOperation } from './protocol/metrics.query-aggregated';
import type { RepositoriesCreateOperation } from './protocol/repositories.create';
import type { RepositoriesDeleteOperation } from './protocol/repositories.delete';
import type { RepositoriesDeletedEvent } from './protocol/repositories.deleted';
import type { RepositoriesListOperation } from './protocol/repositories.list';
import type { RepositoriesUpdateOperation } from './protocol/repositories.update';
import type { RepositoriesUpdatedEvent } from './protocol/repositories.updated';
import type { TaskBoardsCreateOperation } from './protocol/task-boards.create';
import type { TaskBoardsDeleteOperation } from './protocol/task-boards.delete';
import type { TaskBoardsListOperation } from './protocol/task-boards.list';
import type { TaskBoardsUpdateOperation } from './protocol/task-boards.update';
import type { TaskBoardDeletedEvent, TaskBoardUpdatedEvent } from './protocol/task-boards.updated';
import type { TaskDependenciesCreateOperation } from './protocol/task-dependencies.create';
import type { TaskDependenciesDeleteOperation } from './protocol/task-dependencies.delete';
import type { TaskDependenciesListOperation } from './protocol/task-dependencies.list';
import type { TaskDependencyDeletedEvent, TaskDependencyUpdatedEvent } from './protocol/task-dependencies.updated';
import type {
  TaskDispatchSettingsListOperation,
  TaskDispatchSettingsReadOperation,
} from './protocol/task-dispatch-settings.read';
import type { TaskDispatchSettingsUpdateOperation } from './protocol/task-dispatch-settings.update';
import type { TaskDispatchSettingsUpdatedEvent } from './protocol/task-dispatch-settings.updated';
import type { TaskEventsListOperation } from './protocol/task-events.list';
import type { TaskEventRecordedEvent } from './protocol/task-events.recorded';
import type { TaskPoolsCreateOperation } from './protocol/task-pools.create';
import type { TaskPoolsDeleteOperation } from './protocol/task-pools.delete';
import type { TaskPoolsListOperation } from './protocol/task-pools.list';
import type { TaskPoolDeletedEvent, TaskPoolUpdatedEvent } from './protocol/task-pools.updated';
import type { TasksCreateOperation } from './protocol/tasks.create';
import type { TasksDelegateOperation, TasksUndelegateOperation } from './protocol/tasks.delegate';
import type { TasksDeleteOperation } from './protocol/tasks.delete';
import type { TasksListOperation } from './protocol/tasks.list';
import type { TasksRenameOperation } from './protocol/tasks.rename';
import type { TasksUpdateStatusOperation } from './protocol/tasks.update';
import type { TasksUpdateDescriptionOperation } from './protocol/tasks.update-description';
import type { TaskDeletedEvent, TaskUpdatedEvent } from './protocol/tasks.updated';
import type { ThirdPartyAgentInstallsCreateOperation } from './protocol/third-party-agent-installs.create';
import type { ThirdPartyAgentInstallsDeleteOperation } from './protocol/third-party-agent-installs.delete';
import type { ThirdPartyAgentInstallsDeletedEvent } from './protocol/third-party-agent-installs.deleted';
import type { ThirdPartyAgentInstallsDetectClaudeCodeOperation } from './protocol/third-party-agent-installs.detect-claude-code';
import type { ThirdPartyAgentInstallsListOperation } from './protocol/third-party-agent-installs.list';
import type { ThirdPartyAgentInstallsUpdateOperation } from './protocol/third-party-agent-installs.update';
import type { ThirdPartyAgentInstallsUpdatedEvent } from './protocol/third-party-agent-installs.updated';
import type { ThreadSnapshotReadOperation } from './protocol/thread.snapshot.read';
import type { ThreadsListOperation } from './protocol/threads.list';
import type { TranscribeAudioOperation } from './protocol/transcribe-audio';
import type { WorkspacesListOperation } from './protocol/workspaces.list';
import type { WorkspacesUpdatedEvent } from './protocol/workspaces.updated';
import type { WorktreesCreateOperation } from './protocol/worktrees.create';
import type { WorktreesDeleteOperation } from './protocol/worktrees.delete';
import type { WorktreesListOperation } from './protocol/worktrees.list';
import type { WorktreesOpenOperation } from './protocol/worktrees.open';
import type { WorktreesUpdatedEvent } from './protocol/worktrees.updated';

export type DaemonOperations = [
  AgentListOperation,
  AgentReadOperation,
  AgentCreateOperation,
  AgentRenameOperation,
  AgentStopOperation,
  AgentFreshStartOperation,
  AgentCompleteOperation,
  AgentFailOperation,
  AgentLaunchOperation,
  AgentMessageOperation,
  AgentSignalsListOperation,
  AgentSignalsResolveOperation,
  AgentSignalsSendOperation,
  AgentCallsListOperation,
  AgentCallsReadOperation,
  AgentCallsRecordOperation,
  AgentPriceLineItemsListOperation,
  AgentPriceLineItemsRecordOperation,
  AgentTracesListOperation,
  AgentTracesRecordOperation,
  AgentToolCallOperation,
  DatabaseDescribeOperation,
  DatabaseOpenOperation,
  DatabaseMigrateOperation,
  DatabaseRunQueryOperation,
  InferenceProfilesListOperation,
  InferenceProfilesCreateOperation,
  InferenceProfilesUpdateOperation,
  InferenceProfilesDeleteOperation,
  IntegrationsListOperation,
  IntegrationsCreateOperation,
  IntegrationsUpdateOperation,
  IntegrationsDeleteOperation,
  ThirdPartyAgentInstallsListOperation,
  ThirdPartyAgentInstallsCreateOperation,
  ThirdPartyAgentInstallsUpdateOperation,
  ThirdPartyAgentInstallsDeleteOperation,
  ThirdPartyAgentInstallsDetectClaudeCodeOperation,
  AgentRegistriesListOperation,
  AgentRegistriesCreateOperation,
  AgentRegistriesUpdateOperation,
  AgentRegistriesDeleteOperation,
  AppSettingsReadOperation,
  AppSettingsUpdateOperation,
  TranscribeAudioOperation,
  GenerateSpeechOperation,
  DebugLogsListOperation,
  DebugLogsReadOperation,
  DebugLogsOpenDirectoryOperation,
  DebugLogsOpenOperation,
  RepositoriesListOperation,
  RepositoriesCreateOperation,
  RepositoriesUpdateOperation,
  RepositoriesDeleteOperation,
  WorktreesListOperation,
  WorktreesCreateOperation,
  WorktreesDeleteOperation,
  WorktreesOpenOperation,
  WorkspacesListOperation,
  ThreadSnapshotReadOperation,
  ThreadsListOperation,
  DaemonStatusOperation,
  TaskBoardsListOperation,
  TaskBoardsCreateOperation,
  TaskBoardsUpdateOperation,
  TaskBoardsDeleteOperation,
  TaskPoolsListOperation,
  TaskPoolsCreateOperation,
  TaskPoolsDeleteOperation,
  TasksListOperation,
  TasksCreateOperation,
  TasksRenameOperation,
  TasksUpdateDescriptionOperation,
  TasksUpdateStatusOperation,
  TasksDelegateOperation,
  TasksUndelegateOperation,
  TasksDeleteOperation,
  TaskDependenciesListOperation,
  TaskDependenciesCreateOperation,
  TaskDependenciesDeleteOperation,
  TaskEventsListOperation,
  TaskDispatchSettingsReadOperation,
  TaskDispatchSettingsListOperation,
  TaskDispatchSettingsUpdateOperation,
  MetricsListNamesOperation,
  MetricsListVariantsOperation,
  MetricsQueryAggregatedOperation,
];

export type DaemonEvents = [
  AgentLivenessEvent,
  AgentRecordedEvent,
  AgentCallRecordedEvent,
  AgentPriceLineItemRecordedEvent,
  AgentTraceRecordedEvent,
  DebugLogUpdatedEvent,
  InferenceProfilesUpdatedEvent,
  InferenceProfilesDeletedEvent,
  IntegrationsUpdatedEvent,
  IntegrationsDeletedEvent,
  ThirdPartyAgentInstallsUpdatedEvent,
  ThirdPartyAgentInstallsDeletedEvent,
  RepositoriesUpdatedEvent,
  RepositoriesDeletedEvent,
  WorktreesUpdatedEvent,
  WorkspacesUpdatedEvent,
  AgentRegistriesUpdatedEvent,
  AgentRegistriesDeletedEvent,
  AppSettingsUpdatedEvent,
  TaskBoardUpdatedEvent,
  TaskBoardDeletedEvent,
  TaskPoolUpdatedEvent,
  TaskPoolDeletedEvent,
  TaskUpdatedEvent,
  TaskDeletedEvent,
  TaskDependencyUpdatedEvent,
  TaskDependencyDeletedEvent,
  TaskEventRecordedEvent,
  TaskDispatchSettingsUpdatedEvent,
];

export interface ClientProtocol
  extends BridgeProtocol<
    {
      operations: DaemonOperations;
      events: [];
    },
    {
      operations: [];
      events: DaemonEvents;
    }
  > {}

export interface DaemonProtocol
  extends BridgeProtocol<
    {
      operations: [];
      events: DaemonEvents;
    },
    {
      operations: DaemonOperations;
      events: [];
    }
  > {}
