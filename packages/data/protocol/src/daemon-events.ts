import type { AgentCallRecordedEvent } from './protocol/agent.calls.recorded';
import type { AgentLivenessEvent } from './protocol/agent.liveness';
import type { AgentPriceLineItemRecordedEvent } from './protocol/agent.price-line-items.recorded';
import type { AgentQueuedMessageChangedEvent } from './protocol/agent.queued-message.changed';
import type { AgentQueuedMessageDeletedEvent } from './protocol/agent.queued-message.deleted';
import type { AgentRecordedEvent } from './protocol/agent.recorded';
import type { AgentTraceRecordedEvent } from './protocol/agent.traces.recorded';
import type { AgentRegistriesDeletedEvent } from './protocol/agent-registries.deleted';
import type { AgentRegistriesUpdatedEvent } from './protocol/agent-registries.updated';
import type { AppSettingsUpdatedEvent } from './protocol/app-settings.updated';
import type { AutomationDeletedEvent, AutomationUpdatedEvent } from './protocol/automations.updated';
import type { DebugLogUpdatedEvent } from './protocol/debug.logs.updated';
import type { DocumentDeletedEvent } from './protocol/documents.deleted';
import type { DocumentUpdatedEvent } from './protocol/documents.updated';
import type { HeartbeatRecordedEvent } from './protocol/heartbeats.recorded';
import type { InferenceProfilesDeletedEvent } from './protocol/inference-profiles.deleted';
import type { InferenceProfilesUpdatedEvent } from './protocol/inference-profiles.updated';
import type { IntegrationsDeletedEvent } from './protocol/integrations.deleted';
import type { IntegrationsUpdatedEvent } from './protocol/integrations.updated';
import type { KnownIdeDeletedEvent } from './protocol/known-ides.deleted';
import type { KnownIdeUpdatedEvent } from './protocol/known-ides.updated';
import type { MemoryDeletedEvent } from './protocol/memories.deleted';
import type { MemoryUpdatedEvent } from './protocol/memories.updated';
import type { RepositoriesDeletedEvent } from './protocol/repositories.deleted';
import type { RepositoriesUpdatedEvent } from './protocol/repositories.updated';
import type { SkillDeletedEvent } from './protocol/skills.deleted';
import type { SkillUpdatedEvent } from './protocol/skills.updated';
import type { TaskBoardDeletedEvent, TaskBoardUpdatedEvent } from './protocol/task-boards.updated';
import type { TaskDeliverableSubmissionRecordedEvent } from './protocol/task-deliverable-submissions.recorded';
import type { TaskDeliverableDeletedEvent } from './protocol/task-deliverables.delete';
import type { TaskDeliverableUpdatedEvent } from './protocol/task-deliverables.updated';
import type { TaskDependencyDeletedEvent, TaskDependencyUpdatedEvent } from './protocol/task-dependencies.updated';
import type { TaskEventRecordedEvent } from './protocol/task-events.recorded';
import type { TaskPoolDeletedEvent, TaskPoolUpdatedEvent } from './protocol/task-pools.updated';
import type { TaskTemplateDeliverableDeletedEvent } from './protocol/task-template-deliverables.deleted';
import type { TaskTemplateDeliverableUpdatedEvent } from './protocol/task-template-deliverables.updated';
import type { TaskTemplateDeletedEvent } from './protocol/task-templates.deleted';
import type { TaskTemplateUpdatedEvent } from './protocol/task-templates.updated';
import type { TaskDeletedEvent, TaskUpdatedEvent } from './protocol/tasks.updated';
import type { ThirdPartyAgentInstallsDeletedEvent } from './protocol/third-party-agent-installs.deleted';
import type { ThirdPartyAgentInstallsUpdatedEvent } from './protocol/third-party-agent-installs.updated';
import type { TrackedPrRecordedEvent } from './protocol/tracked-prs.recorded';
import type { WorkspacesUpdatedEvent } from './protocol/workspaces.updated';
import type { WorktreesUpdatedEvent } from './protocol/worktrees.updated';

/**
 * Lists every event the daemon can publish to connected clients.
 * Keep this tuple explicit so bridge subscribers can rely on the event surface.
 */
export type DaemonEvents = [
  AgentLivenessEvent,
  AgentRecordedEvent,
  AgentQueuedMessageChangedEvent,
  AgentQueuedMessageDeletedEvent,
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
  MemoryUpdatedEvent,
  MemoryDeletedEvent,
  SkillUpdatedEvent,
  SkillDeletedEvent,
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
  TaskDeliverableDeletedEvent,
  TaskDeliverableSubmissionRecordedEvent,
  TrackedPrRecordedEvent,
  AutomationUpdatedEvent,
  AutomationDeletedEvent,
  HeartbeatRecordedEvent,
];
