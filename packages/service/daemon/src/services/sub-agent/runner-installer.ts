import type { Datastore } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type { Agent, DataCells } from '@two-pebble/pebble';
import { FrameworkAgent, PebbleAgent } from '@two-pebble/pebble';
import { buildCapability, installCapabilityRunners } from '@two-pebble/pebble/capabilities';
import type { DaemonBridge } from '../../types';
import type { AgentRegistryService } from '../agent-registry-service';
import type { CapabilitySpec } from '../register-pebble-capabilities';
import { attachFreshPebbleCapabilities } from '../register-pebble-capabilities';
import { ChildSideRunner } from './child-side-runner';
import { ParentSideRunner } from './parent-side-runner';
import { readSubAgentReferenceMap } from './runner-helpers';
import type { SubAgentCoordinator } from './sub-agent-coordinator';

interface InstallRunnersInput {
  agent: Agent;
  agentId: string;
  agentRegistry: AgentRegistryService;
  bridge: DaemonBridge;
  coordinator: SubAgentCoordinator;
  logger: Logger;
  specs: CapabilitySpec[];
}

interface InstallFreshAgentInput {
  agent: Agent;
  agentId: string;
  agentRegistry: AgentRegistryService;
  bridge: DaemonBridge;
  coordinator: SubAgentCoordinator;
  datastore: Datastore;
  logger: Logger;
  parentAgentId?: string;
  specs: CapabilitySpec[];
}

interface AttachParentLinkInput {
  agent: Agent;
  coordinator: SubAgentCoordinator;
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

/**
 * Installs the parent-side sub-agent runner onto the agent if its spec
 * list declares the `sub-agent` capability. Reference name → registry
 * id mapping is read off the spec config so spawn calls resolve at
 * runtime without re-reading the registry row.
 */
export function installSubAgentRunner(input: InstallRunnersInput): void {
  if (!input.specs.some((spec) => spec.id === 'sub-agent')) {
    return;
  }
  installCapabilityRunners(input.agent, {
    subAgent: new ParentSideRunner({
      agentRegistry: input.agentRegistry,
      bridge: input.bridge,
      coordinator: input.coordinator,
      logger: input.logger,
      parentAgentId: input.agentId,
      references: readSubAgentReferenceMap(input.specs),
    }),
  });
}

/**
 * Attaches `ParentLinkCapability` to a child agent and installs the
 * matching child-side runner. Auto-applied by the daemon for any agent
 * with a non-null `parentAgentId`; the registry config never needs to
 * declare it.
 */
export function attachParentLinkCapability(input: AttachParentLinkInput): void {
  if (!(input.agent instanceof PebbleAgent)) {
    return;
  }
  installCapabilityRunners(input.agent, {
    parentLink: new ChildSideRunner({
      childAgentId: input.agent.agentId,
      coordinator: input.coordinator,
      parentAgentId: input.parentAgentId,
    }),
  });
  if (input.mode === 'fresh') {
    input.agent.registerCapability(buildCapability('parent-link'), { parentAgentId: input.parentAgentId });
  } else {
    input.agent.hydrateCapability(buildCapability('parent-link'), { parentAgentId: input.parentAgentId }, new Map());
  }
}

/**
 * Wires a framework sub-agent into the parent-link signal protocol without
 * giving it a Pebble capability. The framework adapter has no slots to
 * persist `pendingParentResponse` state, so the bookkeeping lives on the
 * agents row (`parentResponseSignalId`): the wake path stamps it when a
 * parent push arrives, and this listener clears it by resolving the
 * parent's awaited signal whenever the framework settles into idle with a
 * final assistant message.
 */
export function attachFrameworkParentLinkBridge(input: AttachFrameworkParentLinkInput): void {
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
    // The signal is in `received` state now; the parent has to be woken so
    // the waiting agent rehydrates, consumes the response in `hookOnSignal`,
    // and transitions the signal from `received` → `resolved`. Without this
    // wake the parent stays stuck in `waiting` indefinitely.
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

/**
 * Installs the parent-side runner, attaches Pebble capabilities, and
 * (when applicable) attaches the child-side parent-link capability.
 * One entry point so the daemon's runAgent path stays small and the
 * fresh-launch ordering lives next to the rest of the runner wiring.
 */
export function installFreshLaunchAgent(input: InstallFreshAgentInput): void {
  installSubAgentRunner({
    agent: input.agent,
    agentId: input.agentId,
    agentRegistry: input.agentRegistry,
    bridge: input.bridge,
    coordinator: input.coordinator,
    logger: input.logger,
    specs: input.specs,
  });
  attachFreshPebbleCapabilities({ agent: input.agent, capabilities: input.specs, logger: input.logger });
  if (input.parentAgentId !== undefined) {
    attachParentLinkCapability({
      agent: input.agent,
      coordinator: input.coordinator,
      mode: 'fresh',
      parentAgentId: input.parentAgentId,
    });
    attachFrameworkParentLinkBridge({
      agent: input.agent,
      agentId: input.agentId,
      agentRegistry: input.agentRegistry,
      datastore: input.datastore,
      logger: input.logger,
      parentAgentId: input.parentAgentId,
    });
  }
}
