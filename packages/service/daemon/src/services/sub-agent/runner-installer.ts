import type { Logger } from '@two-pebble/logger';
import type { Agent } from '@two-pebble/pebble';
import { Cell, PebbleAgent } from '@two-pebble/pebble';
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

interface DeliverInitialSpawnMessageInput {
  childAgentId: string;
  coordinator: SubAgentCoordinator;
  message: string;
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
  }
}

/**
 * Delivers the spawn-time initial message to a child agent through the
 * coordinator with a `Parent Agent Ask` envelope (expectsReply true).
 * Used in place of `emitIncomingMessage` so the child sees the message
 * under a peer label and its exit hook blocks settling without a reply.
 */
export async function deliverInitialSpawnMessage(input: DeliverInitialSpawnMessageInput): Promise<void> {
  await input.coordinator.deliver({
    recipientAgentId: input.childAgentId,
    message: {
      content: [Cell.text(input.message)],
      expectsReply: true,
      fromAgentId: input.parentAgentId,
      label: 'Parent Agent Ask',
      receivedAt: Date.now(),
    },
  });
}
