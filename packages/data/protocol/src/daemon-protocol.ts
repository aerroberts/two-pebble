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
import type { AgentQueuedMessageChangedEvent } from './protocol/agent.queued-message.changed';
import type { AgentQueuedMessageEnqueueOperation } from './protocol/agent.queued-message.enqueue';
import type { AgentQueuedMessagesListOperation } from './protocol/agent.queued-messages.list';
import type { AgentReadOperation } from './protocol/agent.read';
import type { AgentRecordedEvent } from './protocol/agent.recorded';
import type { AgentRenameOperation } from './protocol/agent.rename';
import type { AgentResumeOperation } from './protocol/agent.resume';
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
import type { AutomationsCreateOperation } from './protocol/automations.create';
import type { AutomationsDeleteOperation } from './protocol/automations.delete';
import type { AutomationsListOperation } from './protocol/automations.list';
import type { AutomationsRunNowOperation } from './protocol/automations.run-now';
import type { AutomationsUpdateOperation } from './protocol/automations.update';
import type { AutomationDeletedEvent, AutomationUpdatedEvent } from './protocol/automations.updated';
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
import type { CreateDocumentOperation } from './protocol/documents.create';
import type { DeleteDocumentOperation } from './protocol/documents.delete';
import type { DocumentDeletedEvent } from './protocol/documents.deleted';
import type { DocumentsListOperation } from './protocol/documents.list';
import type { ReadDocumentOperation } from './protocol/documents.read';
import type { UpdateDocumentOperation } from './protocol/documents.update';
import type { DocumentUpdatedEvent } from './protocol/documents.updated';
import type { GenerateSpeechOperation } from './protocol/generate-speech';
import type { HeartbeatsListOperation } from './protocol/heartbeats.list';
import type { HeartbeatRecordedEvent } from './protocol/heartbeats.recorded';
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
import type { CreateKnownIdeOperation } from './protocol/known-ides.create';
import type { DeleteKnownIdeOperation } from './protocol/known-ides.delete';
import type { KnownIdeDeletedEvent } from './protocol/known-ides.deleted';
import type { DetectIdesOperation } from './protocol/known-ides.detect';
import type { ListKnownIdesOperation } from './protocol/known-ides.list';
import type { OpenWorkspaceInIdeOperation } from './protocol/known-ides.open-workspace';
import type { KnownIdeUpdatedEvent } from './protocol/known-ides.updated';
import type { MetricsListNamesOperation } from './protocol/metrics.list-names';
import type { MetricsListVariantsOperation } from './protocol/metrics.list-variants';
import type { MetricsQueryAggregatedOperation } from './protocol/metrics.query-aggregated';
import type { ProjectsCreateOperation } from './protocol/projects.create';
import type { ProjectsDeleteOperation } from './protocol/projects.delete';
import type { ProjectsListOperation } from './protocol/projects.list';
import type { ProjectsUpdateOperation } from './protocol/projects.update';
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
import type { TaskDeliverableSubmissionsListOperation } from './protocol/task-deliverable-submissions.list';
import type { TaskDeliverableSubmissionRecordedEvent } from './protocol/task-deliverable-submissions.recorded';
import type { TaskDeliverableSubmissionsSubmitOperation } from './protocol/task-deliverable-submissions.submit';
import type { TaskDeliverablesCreateOperation } from './protocol/task-deliverables.create';
import type { TaskDeliverablesListOperation } from './protocol/task-deliverables.list';
import type { TaskDeliverableUpdatedEvent } from './protocol/task-deliverables.updated';
import type { TaskDependenciesCreateOperation } from './protocol/task-dependencies.create';
import type { TaskDependenciesDeleteOperation } from './protocol/task-dependencies.delete';
import type { TaskDependenciesListOperation } from './protocol/task-dependencies.list';
import type { TaskDependencyDeletedEvent, TaskDependencyUpdatedEvent } from './protocol/task-dependencies.updated';
import type { TaskEventsListOperation } from './protocol/task-events.list';
import type { TaskEventRecordedEvent } from './protocol/task-events.recorded';
import type { TaskPoolsCreateOperation } from './protocol/task-pools.create';
import type { TaskPoolsDeleteOperation } from './protocol/task-pools.delete';
import type { TaskPoolsListOperation } from './protocol/task-pools.list';
import type { TaskPoolDeletedEvent, TaskPoolUpdatedEvent } from './protocol/task-pools.updated';
import type { TaskTemplateDeliverablesCreateOperation } from './protocol/task-template-deliverables.create';
import type { TaskTemplateDeliverablesDeleteOperation } from './protocol/task-template-deliverables.delete';
import type { TaskTemplateDeliverableDeletedEvent } from './protocol/task-template-deliverables.deleted';
import type { TaskTemplateDeliverablesListOperation } from './protocol/task-template-deliverables.list';
import type { TaskTemplateDeliverablesUpdateOperation } from './protocol/task-template-deliverables.update';
import type { TaskTemplateDeliverableUpdatedEvent } from './protocol/task-template-deliverables.updated';
import type { TaskTemplatesCreateOperation } from './protocol/task-templates.create';
import type { TaskTemplatesDeleteOperation } from './protocol/task-templates.delete';
import type { TaskTemplateDeletedEvent } from './protocol/task-templates.deleted';
import type { TaskTemplatesListOperation } from './protocol/task-templates.list';
import type { TaskTemplatesReadOperation } from './protocol/task-templates.read';
import type { TaskTemplatesUpdateOperation } from './protocol/task-templates.update';
import type { TaskTemplateUpdatedEvent } from './protocol/task-templates.updated';
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
import type { ThirdPartyAgentInstallsDetectCodexOperation } from './protocol/third-party-agent-installs.detect-codex';
import type { ThirdPartyAgentInstallsListOperation } from './protocol/third-party-agent-installs.list';
import type { ThirdPartyAgentInstallsUpdateOperation } from './protocol/third-party-agent-installs.update';
import type { ThirdPartyAgentInstallsUpdatedEvent } from './protocol/third-party-agent-installs.updated';
import type { ThreadSnapshotReadOperation } from './protocol/thread.snapshot.read';
import type { ThreadsListOperation } from './protocol/threads.list';
import type { TrackedPrsListOperation } from './protocol/tracked-prs.list';
import type { TrackedPrRecordedEvent } from './protocol/tracked-prs.recorded';
import type { TranscribeAudioOperation } from './protocol/transcribe-audio';
import type { WorkspacesListOperation } from './protocol/workspaces.list';
import type { WorkspacesUpdatedEvent } from './protocol/workspaces.updated';
import type { WorktreesCreateOperation } from './protocol/worktrees.create';
import type { WorktreesDeleteOperation } from './protocol/worktrees.delete';
import type { WorktreesListOperation } from './protocol/worktrees.list';
import type { WorktreesOpenOperation } from './protocol/worktrees.open';
import type { WorktreesUpdatedEvent } from './protocol/worktrees.updated';

/**
 * Lists every operation the daemon accepts from connected clients.
 * Keep this tuple explicit so the bridge protocol remains easy to audit.
 */
export type DaemonOperations = [
  AgentListOperation,
  AgentReadOperation,
  AgentCreateOperation,
  AgentRenameOperation,
  AgentStopOperation,
  AgentResumeOperation,
  AgentFreshStartOperation,
  AgentCompleteOperation,
  AgentFailOperation,
  AgentLaunchOperation,
  AgentMessageOperation,
  AgentQueuedMessageEnqueueOperation,
  AgentQueuedMessagesListOperation,
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
  ProjectsListOperation,
  ProjectsCreateOperation,
  ProjectsUpdateOperation,
  ProjectsDeleteOperation,
  InferenceProfilesListOperation,
  InferenceProfilesCreateOperation,
  InferenceProfilesUpdateOperation,
  InferenceProfilesDeleteOperation,
  IntegrationsListOperation,
  IntegrationsCreateOperation,
  IntegrationsUpdateOperation,
  IntegrationsDeleteOperation,
  DetectIdesOperation,
  ListKnownIdesOperation,
  CreateKnownIdeOperation,
  DeleteKnownIdeOperation,
  OpenWorkspaceInIdeOperation,
  ThirdPartyAgentInstallsListOperation,
  ThirdPartyAgentInstallsCreateOperation,
  ThirdPartyAgentInstallsUpdateOperation,
  ThirdPartyAgentInstallsDeleteOperation,
  ThirdPartyAgentInstallsDetectClaudeCodeOperation,
  ThirdPartyAgentInstallsDetectCodexOperation,
  AgentRegistriesListOperation,
  AgentRegistriesCreateOperation,
  AgentRegistriesUpdateOperation,
  AgentRegistriesDeleteOperation,
  AppSettingsReadOperation,
  AppSettingsUpdateOperation,
  AutomationsListOperation,
  AutomationsCreateOperation,
  AutomationsUpdateOperation,
  AutomationsDeleteOperation,
  AutomationsRunNowOperation,
  HeartbeatsListOperation,
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
  DocumentsListOperation,
  CreateDocumentOperation,
  ReadDocumentOperation,
  UpdateDocumentOperation,
  DeleteDocumentOperation,
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
  TaskTemplatesListOperation,
  TaskTemplatesCreateOperation,
  TaskTemplatesReadOperation,
  TaskTemplatesUpdateOperation,
  TaskTemplatesDeleteOperation,
  TaskTemplateDeliverablesListOperation,
  TaskTemplateDeliverablesCreateOperation,
  TaskTemplateDeliverablesUpdateOperation,
  TaskTemplateDeliverablesDeleteOperation,
  TaskDeliverablesListOperation,
  TaskDeliverablesCreateOperation,
  TaskDeliverableSubmissionsListOperation,
  TaskDeliverableSubmissionsSubmitOperation,
  TrackedPrsListOperation,
  MetricsListNamesOperation,
  MetricsListVariantsOperation,
  MetricsQueryAggregatedOperation,
];

/**
 * Lists every event the daemon can publish to connected clients.
 * Keep this tuple explicit so bridge subscribers can rely on the event surface.
 */
export type DaemonEvents = [
  AgentLivenessEvent,
  AgentRecordedEvent,
  AgentQueuedMessageChangedEvent,
  AgentCallRecordedEvent,
  AgentPriceLineItemRecordedEvent,
  AgentTraceRecordedEvent,
  DebugLogUpdatedEvent,
  InferenceProfilesUpdatedEvent,
  InferenceProfilesDeletedEvent,
  IntegrationsUpdatedEvent,
  IntegrationsDeletedEvent,
  KnownIdeUpdatedEvent,
  KnownIdeDeletedEvent,
  ThirdPartyAgentInstallsUpdatedEvent,
  ThirdPartyAgentInstallsDeletedEvent,
  RepositoriesUpdatedEvent,
  RepositoriesDeletedEvent,
  DocumentUpdatedEvent,
  DocumentDeletedEvent,
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
  TaskTemplateUpdatedEvent,
  TaskTemplateDeletedEvent,
  TaskTemplateDeliverableUpdatedEvent,
  TaskTemplateDeliverableDeletedEvent,
  TaskDeliverableUpdatedEvent,
  TaskDeliverableSubmissionRecordedEvent,
  TrackedPrRecordedEvent,
  AutomationUpdatedEvent,
  AutomationDeletedEvent,
  HeartbeatRecordedEvent,
];

/**
 * Describes the protocol surface available to the client side of the bridge.
 * Client code sends daemon operations and receives daemon events through this type.
 */
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

/**
 * Describes the protocol surface implemented by the daemon side of the bridge.
 * Daemon code receives client operations and publishes daemon events through this type.
 */
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
