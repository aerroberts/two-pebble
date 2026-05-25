import type { Datastore } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type { Agent, DataCells } from '@two-pebble/pebble';
import { FrameworkAgent, PebbleAgent } from '@two-pebble/pebble';
import { buildCapability } from '@two-pebble/pebble/capabilities';
import type { CapabilitySpec } from '../register-pebble-capabilities';
import { attachFreshPebbleCapabilities } from '../register-pebble-capabilities';
import type { AgentRegistryService } from '../service';
import type { SubAgentCoordinator } from './sub-agent-coordinator';

interface InstallFreshAgentInput {
  agent: Agent;
  agentId: string;
  agentRegistry: AgentRegistryService;
  coordinator: SubAgentCoordinator;
  datastore: Datastore;
  logger: Logger;
  parentAgentId?: string;
  specs: CapabilitySpec[];
}

interface AttachParentLinkInput {
  agent: Agent;
  mode: 'fresh' | 'rehydrate';
  parentAgentId: string;
}

interface AttachFrameworkParentLinkInput {
  agent: Agent;
  agentId: string;
  agentRegistry: AgentRegistryService;
  datastore: Datastore;
  logger: Logger;
  parentAgentId: string;
}

export function attachParentLinkCapability(input: AttachParentLinkInput): void {
  if (!(input.agent instanceof PebbleAgent)) {
    return;
  }
  if (input.mode === 'fresh') {
    input.agent.registerCapability(buildCapability('parent-link'), { parentAgentId: input.parentAgentId });
  } else {
    input.agent.hydrateCapability(buildCapability('parent-link'), { parentAgentId: input.parentAgentId }, new Map());
  }
}

export function attachFrameworkParentLink(input: AttachFrameworkParentLinkInput): void {
  if (!(input.agent instanceof FrameworkAgent)) {
    return;
  }
  const agentRegistry = input.agentRegistry;
  const datastore = input.datastore;
  const logger = input.logger;
  const parentAgentId = input.parentAgentId;
  const agentId = input.agentId;
  input.agent.on('finalMessage', (event) => {
    void resolveFrameworkResponse({
      agentId,
      agentRegistry,
      content: event.content,
      datastore,
      logger,
      parentAgentId,
    });
  });
}

export function installFreshLaunchAgent(input: InstallFreshAgentInput): void {
  attachFreshPebbleCapabilities({ agent: input.agent, capabilities: input.specs, logger: input.logger });
  if (input.parentAgentId !== undefined) {
    attachParentLinkCapability({
      agent: input.agent,
      mode: 'fresh',
      parentAgentId: input.parentAgentId,
    });
    attachFrameworkParentLink({
      agent: input.agent,
      agentId: input.agentId,
      agentRegistry: input.agentRegistry,
      datastore: input.datastore,
      logger: input.logger,
      parentAgentId: input.parentAgentId,
    });
  }
}

interface ResolveFrameworkResponseInput {
  agentId: string;
  agentRegistry: AgentRegistryService;
  content: DataCells;
  datastore: Datastore;
  logger: Logger;
  parentAgentId: string;
}

async function resolveFrameworkResponse(input: ResolveFrameworkResponseInput): Promise<void> {
  try {
    const record = await input.datastore.agent.read({ id: input.agentId });
    const responseSignalId = record.parentResponseSignalId;
    if (responseSignalId === null || responseSignalId === undefined || responseSignalId.length === 0) {
      return;
    }
    await input.datastore.agent.signals.resolve({
      agentId: input.parentAgentId,
      capabilityId: 'sub-agent',
      signalId: responseSignalId,
      data: {
        childAgentId: input.agentId,
        message: extractMessageText(input.content),
        type: 'sub-agent-response',
      },
    });
    await input.datastore.agent.setParentResponseSignalId({
      id: input.agentId,
      parentResponseSignalId: null,
    });
    await input.agentRegistry.wakeIfSignalsReady(input.parentAgentId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    input.logger.warn('framework parent-link resolve failed', { agentId: input.agentId, error: message });
  }
}

function extractMessageText(content: DataCells): string {
  const parts: string[] = [];
  for (const cell of content) {
    if (cell.type === 'text') {
      parts.push(cell.content.text);
    } else if (cell.type === 'header1' || cell.type === 'header2') {
      parts.push(cell.content.text);
    } else if (cell.type === 'codeBlock') {
      parts.push(cell.content.code);
    }
  }
  return parts.join('\n');
}
