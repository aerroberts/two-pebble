import type { CellContent } from '@two-pebble/pebble';
import type { AgentRecord, AgentStatus } from '../states/agents/types';
import type { AppSettingsRecord } from '../states/app-settings/types';
import type { ProjectRecord } from '../states/projects/types';
import type { RealtimeOperationContext } from '../types';

export interface SendAssistantMessageInput {
  projectId?: string;
  /** Markdown/text fallback for legacy logging and voice workflows. */
  message: string;
  /**
   * Structured cells produced by the rich composer. When present, the
   * daemon delivers these to the agent instead of wrapping `message` as a
   * single text cell.
   */
  cells?: CellContent[];
}

export interface SendAssistantMessageResult {
  agentId: string;
  launched: boolean;
}

const RELAUNCH_STATUSES = new Set<AgentStatus>(['failed', 'offline']);

export function sendAssistantMessageOperation(ctx: RealtimeOperationContext) {
  return async function sendAssistantMessage(input: SendAssistantMessageInput): Promise<SendAssistantMessageResult> {
    const message = input.message.trim();
    const cells = input.cells;
    if (message.length === 0 && (cells === undefined || cells.length === 0)) {
      throw new Error('Assistant message cannot be empty.');
    }

    const projectId = input.projectId ?? 'proj_default';
    const project = await readProject(ctx, projectId);
    const settings = await readSettings(ctx);
    const registryId = project.assistantAgentRegistryId ?? settings.assistantAgentRegistryId;
    if (registryId === null) {
      throw new Error('Pick an Assistant agent in Settings before sending.');
    }

    const currentAgent = await readCurrentAgent(ctx, project.assistantAgentId ?? settings.assistantAgentId);
    if (currentAgent === null || RELAUNCH_STATUSES.has(currentAgent.status)) {
      const launched = await ctx.datastore.agent.launch({
        agentRegistryId: registryId,
        message,
        projectId,
        ...(cells === undefined ? {} : { cells }),
      });
      await ctx.datastore.projects.update({ id: projectId, assistantAgentId: launched.id });
      await ctx.datastore.appSettings.update({
        defaultKnownIdeId: settings.defaultKnownIdeId,
        defaultTranscriptionProfileId: settings.defaultTranscriptionProfileId,
        defaultSpeechProfileId: settings.defaultSpeechProfileId,
        assistantAgentRegistryId: settings.assistantAgentRegistryId,
        assistantAgentId: launched.id,
        assistantCommandKEnabled: settings.assistantCommandKEnabled,
        assistantCommandKVoiceModeEnabled: settings.assistantCommandKVoiceModeEnabled,
      });
      return { agentId: launched.id, launched: true };
    }

    await ctx.datastore.agent.sendMessage({
      agentId: currentAgent.id,
      message,
      ...(cells === undefined ? {} : { cells }),
    });
    return { agentId: currentAgent.id, launched: false };
  };
}

async function readSettings(ctx: RealtimeOperationContext): Promise<AppSettingsRecord> {
  const cached = ctx.datastore.state.appSettings.value;
  if (cached !== null) {
    return cached;
  }
  const settings = await ctx.datastore.emit('readAppSettings', {});
  ctx.datastore.patch({ appSettings: ctx.datastore.state.appSettings.withValue(settings) });
  return settings;
}

async function readProject(ctx: RealtimeOperationContext, projectId: string): Promise<ProjectRecord> {
  const cached = ctx.datastore.state.projects.getItem(projectId)?.value ?? null;
  if (cached !== null) {
    return cached;
  }
  const result = await ctx.datastore.emit('listProjects', {});
  ctx.datastore.patch({ projects: ctx.datastore.state.projects.withReadyItems(result.items) });
  const project = result.items.find((item) => item.id === projectId);
  if (project === undefined) {
    throw new Error(`Project not found: ${projectId}`);
  }
  return project;
}

async function readCurrentAgent(ctx: RealtimeOperationContext, agentId: string | null): Promise<AgentRecord | null> {
  if (agentId === null) {
    return null;
  }
  const cached = ctx.datastore.state.agents.getItem(agentId)?.value ?? null;
  if (cached !== null) {
    return cached;
  }
  try {
    return await ctx.datastore.agent.read({ id: agentId });
  } catch {
    return null;
  }
}
