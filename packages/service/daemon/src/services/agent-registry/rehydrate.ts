import type { AgentRegistryRecord, Datastore } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type { Agent, AgentBridge, ConversationThreadCell, PebbleJsonRecord, PebbleJsonValue } from '@two-pebble/pebble';
import { PebbleAgent } from '@two-pebble/pebble';
import { buildLaunchAgent } from './build-launch-agent';
import {
  attachRehydratedPebbleCapabilities,
  type CapabilityRehydrateSlots,
  type CapabilitySpec,
  parseCapabilitySpecs,
} from './register-pebble-capabilities';
import type { BuildLaunchAgentInput } from './types';

export interface RehydrateAgentInput {
  agentBridge: AgentBridge;
  agentId: string;
  datastore: Datastore;
  logger: Logger;
}

interface ParseMetadataInput {
  agentId: string;
  logger: Logger;
  serialized: string;
}

interface LoadRestoredThreadInput {
  datastore: Datastore;
  metadata: PebbleJsonRecord;
}

interface LoadCapabilitySlotsInput {
  agentId: string;
  datastore: Datastore;
}

interface ResolveBuildParamsInput {
  agentBridge: AgentBridge;
  datastore: Datastore;
  registry: AgentRegistryRecord;
  resumeMetadata: PebbleJsonRecord;
  workspacePath: string;
}

interface ResolveBuildParamsResult {
  description: string;
  params: BuildLaunchAgentInput;
}

interface RestoredThread {
  cells: ConversationThreadCell[];
  threadId: string;
}

interface StateSnapshotData {
  capabilityId: string;
  name: string;
  value: PebbleJsonValue;
}

/**
 * Reconstructs an idle or waiting agent from durable state so a follow-up
 * message or resolved signal can be delivered. Framework agents replay through
 * `resumeMetadata`; Pebble agents reload thread cells from the conversation
 * snapshot op and replay state-snapshot traces onto capability slots. The
 * returned agent starts idle; the surrounding service attaches listeners
 * before delivering the message or signal that wakes it.
 */
export async function rehydrateAgent(input: RehydrateAgentInput): Promise<Agent> {
  const record = await input.datastore.agent.read({ id: input.agentId });
  if (
    record.status === 'running' ||
    record.status === 'failed' ||
    record.status === 'offline' ||
    record.status === 'interrupted'
  ) {
    throw new Error(`agent "${input.agentId}" cannot be rehydrated from status "${record.status}"`);
  }
  if (record.agentRegistryId === null || record.agentRegistryId === undefined) {
    throw new Error(`agent "${input.agentId}" has no registry link and cannot be rehydrated`);
  }
  const registry = await input.datastore.agentRegistries.read({ id: record.agentRegistryId });
  const workspace = await input.datastore.workspaces.read({ id: record.workspaceId });
  const resumeMetadata = parseMetadata({
    agentId: record.id,
    logger: input.logger,
    serialized: record.metadata,
  });
  const restoredThread = await loadRestoredThread({
    datastore: input.datastore,
    metadata: resumeMetadata,
  });
  const buildResult = await resolveBuildParams({
    agentBridge: input.agentBridge,
    datastore: input.datastore,
    registry,
    resumeMetadata,
    workspacePath: workspace.path,
  });
  const buildInput =
    buildResult.params.kind === 'pebble' && restoredThread !== undefined
      ? { ...buildResult.params, agentId: record.id, bridge: input.agentBridge, restoredThread }
      : { ...buildResult.params, agentId: record.id, bridge: input.agentBridge };
  const agent = buildLaunchAgent(buildInput);
  if (agent instanceof PebbleAgent) {
    const slots = await loadCapabilitySlots({ agentId: record.id, datastore: input.datastore });
    const registrySpecs = parseCapabilitySpecs(registry.capabilities, input.logger);
    const lifecycleSpecs = await resolveTaskLifecycleSpecs({ agentId: record.id, datastore: input.datastore });
    attachRehydratedPebbleCapabilities({
      agent,
      capabilities: [...registrySpecs, ...lifecycleSpecs],
      logger: input.logger,
      slots,
    });
  }
  return agent;
}

interface ResolveTaskLifecycleSpecsInput {
  agentId: string;
  datastore: Datastore;
}

/**
 * Rebuilds the `task-lifecycle` capability spec for an agent on rehydrate by
 * looking up tasks the agent still owns. The capability slot state (taskId,
 * boardId, completed) is restored from state-snapshot traces, so the config
 * passed here is only structurally required by hydrateCapability.
 */
async function resolveTaskLifecycleSpecs(input: ResolveTaskLifecycleSpecsInput): Promise<CapabilitySpec[]> {
  const { items: boards } = await input.datastore.taskBoards.list({});
  for (const board of boards) {
    const { items: tasks } = await input.datastore.taskBoards.tasks.list({ boardId: board.id });
    const owned = tasks.find((task) => task.ownerId === input.agentId);
    if (owned !== undefined) {
      return [{ id: 'task-lifecycle', config: { taskId: owned.id, boardId: board.id } }];
    }
  }
  return [];
}

async function resolveBuildParams(input: ResolveBuildParamsInput): Promise<ResolveBuildParamsResult> {
  if (input.registry.kind === 'framework') {
    if (input.registry.thirdPartyAgentInstallId === null) {
      throw new Error(`agent registry "${input.registry.id}" has no third-party agent install`);
    }
    const install = await input.datastore.thirdPartyAgentInstalls.read({
      id: input.registry.thirdPartyAgentInstallId,
    });
    const description = `${install.name} (${install.frameworkId})`;
    return {
      description,
      params: {
        agentId: '',
        bridge: input.agentBridge,
        description,
        install,
        kind: 'framework',
        registry: input.registry,
        resumeMetadata: input.resumeMetadata,
        workspacePath: input.workspacePath,
      },
    };
  }
  if (input.registry.inferenceProfileId === null) {
    throw new Error(`agent registry "${input.registry.id}" has no inference profile`);
  }
  const inferenceProfile = await input.datastore.inferenceProfiles.read({
    id: input.registry.inferenceProfileId,
  });
  const integration = await input.datastore.integrations.read({ id: inferenceProfile.integrationId });
  const description = `${inferenceProfile.name} (${integration.provider})`;
  return {
    description,
    params: {
      agentId: '',
      bridge: input.agentBridge,
      description,
      inferenceProfile,
      integration,
      kind: 'pebble',
      registry: input.registry,
      resumeMetadata: input.resumeMetadata,
      workspacePath: input.workspacePath,
    },
  };
}

async function loadRestoredThread(input: LoadRestoredThreadInput): Promise<RestoredThread | undefined> {
  const threadId = input.metadata.threadId;
  if (typeof threadId !== 'string' || threadId.length === 0) {
    return undefined;
  }
  const snapshot = await input.datastore.agent.conversationCells.snapshot({ threadId });
  const cells: ConversationThreadCell[] = snapshot.items.map((item) => ({
    orderId: item.orderId,
    cells: item.content,
    label: item.label,
    role: item.role,
    threadId: item.threadId,
  }));
  return { threadId, cells };
}

async function loadCapabilitySlots(input: LoadCapabilitySlotsInput): Promise<CapabilityRehydrateSlots> {
  const result = await input.datastore.agent.traces.listByType({ agentId: input.agentId, type: 'state-snapshot' });
  const slots: CapabilityRehydrateSlots = new Map();
  for (const item of result.items) {
    if (item.type !== 'state-snapshot') {
      continue;
    }
    const data = item.data as StateSnapshotData;
    let bucket = slots.get(data.capabilityId);
    if (bucket === undefined) {
      bucket = new Map<string, PebbleJsonValue>();
      slots.set(data.capabilityId, bucket);
    }
    bucket.set(data.name, data.value);
  }
  return slots;
}

function parseMetadata(input: ParseMetadataInput): PebbleJsonRecord {
  try {
    const parsed = JSON.parse(input.serialized) as PebbleJsonValue;
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    input.logger.warn('agent metadata parse failed', { agentId: input.agentId, error: message });
    return {};
  }
}
