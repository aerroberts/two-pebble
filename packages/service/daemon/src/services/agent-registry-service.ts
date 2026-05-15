import type { Datastore } from '@two-pebble/datastore';
import { Events } from '@two-pebble/events';
import type { Logger } from '@two-pebble/logger';
import type { Agent } from '@two-pebble/pebble';
import { Cell, PebbleAgent } from '@two-pebble/pebble';
import { installCapabilityRunners } from '@two-pebble/pebble/capabilities';
import type { AgentRegistryServiceContext, DaemonBridge } from '../types';
import { resolveBuildInput } from './agent-registry-build-input';
import { emitWorktreeInitializedTrace, resolveLaunchWorkspace } from './agent-registry-launch-workspace';
import { buildAgentListenerContext } from './agent-registry-listener-context';
import { installAgentPersistenceListeners, installSubAgentListeners } from './agent-registry-listeners';
import { rehydrateAgent } from './agent-registry-rehydrate';
import { repairBlockedSubAgentAskSignal, repairBlockedSubAgentAskSignals } from './agent-registry-signal-repair';
import { interruptStaleRunningAgents, persistAgentMetadata } from './agent-registry-status';
import type { SubAgentCreatePromiseMap } from './agent-registry-sub-agents';
import type { AgentRegistryServiceEventMap, LaunchAgentInput, RunAgentInput } from './agent-registry-types';
import { readResumeMetadata } from './agent-resume-metadata';
import { buildLaunchAgent } from './build-launch-agent';
import { parseCapabilitySpecs } from './register-pebble-capabilities';
import { DaemonSignalRunner } from './signal-runner/daemon-signal-runner';
import {
  attachParentLinkCapability,
  installFreshLaunchAgent,
  installSubAgentRunner,
} from './sub-agent/runner-installer';
import type { AgentTerminateInput } from './sub-agent/runner-types';
import { SubAgentCoordinator } from './sub-agent/sub-agent-coordinator';
import { installTaskBoardRunner } from './task-board-runner/install';
import type { TaskBoardService } from './task-board-service';

/**
 * Owns the lifecycle of every active runtime agent the daemon is managing.
 * Resolves an agent registry row into a runtime agent, hooks the durable
 * persistence listeners, and tracks active agents so handlers like
 * `callAgentTool` can look them up by id.
 */
export class AgentRegistryService {
  private readonly activeAgents = new Map<string, Agent>();
  private readonly datastore: Datastore;
  private readonly logger: Logger;
  private readonly multicastBridge: DaemonBridge;
  private readonly taskBoards: TaskBoardService;
  private readonly subAgentCreatePromises: SubAgentCreatePromiseMap = new Map();
  private readonly pendingRehydrations = new Map<string, Promise<Agent>>();
  private coordinator: SubAgentCoordinator | undefined;

  /**
   * In-process emitter the dispatcher subscribes to so it can react to
   * agent lifecycle edges (terminal status frees a slot; running occupies
   * one). Status changes routed through `persistAgentStatus` fire here.
   */
  public readonly events = new Events<AgentRegistryServiceEventMap>();

  public constructor(context: AgentRegistryServiceContext) {
    this.datastore = context.datastore;
    this.logger = context.logger;
    this.multicastBridge = context.multicastBridge;
    this.taskBoards = context.taskBoards;
  }
  private getCoordinator(): SubAgentCoordinator {
    if (this.coordinator === undefined) {
      this.coordinator = new SubAgentCoordinator({
        agentRegistry: this,
        bridge: this.multicastBridge,
        datastore: this.datastore,
        logger: this.logger,
      });
    }
    return this.coordinator;
  }

  /**
   * Marks a child stopped and removes its hot runtime object.
   */
  public async terminate(input: AgentTerminateInput): Promise<void> {
    this.deactivate(input.agentId);
    const updated = await this.datastore.agent.setStatus({ id: input.agentId, status: 'offline' });
    this.multicastBridge.emit('agentRecorded', updated);
    this.events.emit('agentStatusChanged', { agentId: input.agentId, status: 'offline' });
  }

  /**
   * Audits durable lifecycle state at daemon boot. A runtime agent cannot
   * survive process restart, so any persisted running row is interrupted.
   */
  public async hydrate(): Promise<void> {
    await interruptStaleRunningAgents({ datastore: this.datastore, logger: this.logger });
    await repairBlockedSubAgentAskSignals({ agentRegistry: this, datastore: this.datastore });
  }

  /**
   * Returns the active runtime agent for an id, or undefined if it has
   * already finished or never launched. Callers narrow the returned Agent
   * to the variant they need (e.g. PebbleAgent for tool calls).
   */
  public get(agentId: string): Agent | undefined {
    return this.activeAgents.get(agentId);
  }

  /**
   * Removes a runtime object from the hot registry.
   * Durable status is left to the caller.
   */
  public deactivate(agentId: string): void {
    this.activeAgents.delete(agentId);
    this.pendingRehydrations.delete(agentId);
  }

  /**
   * Moves stale running work into interrupted limbo.
   * This is used when no hot runtime object exists.
   */
  public async interrupt(agentId: string, reason: string): Promise<void> {
    this.deactivate(agentId);
    const updated = await this.datastore.agent.setStatus({ id: agentId, status: 'interrupted' });
    this.multicastBridge.emit('agentRecorded', updated);
    this.events.emit('agentStatusChanged', { agentId, status: 'interrupted' });
    this.logger.warn('agent interrupted', { agentId, reason });
  }

  /**
   * Returns the active runtime agent for an id, rebuilding it from durable
   * state if no live instance is cached. Concurrent calls for the same id
   * are coalesced so the framework adapter is only constructed once per miss.
   */
  public async rehydrate(agentId: string): Promise<Agent> {
    const cached = this.activeAgents.get(agentId);
    if (cached !== undefined) {
      return cached;
    }
    const inflight = this.pendingRehydrations.get(agentId);
    if (inflight !== undefined) {
      return inflight;
    }
    const promise = this.buildRehydratedAgent(agentId);
    this.pendingRehydrations.set(agentId, promise);
    try {
      return await promise;
    } finally {
      if (this.pendingRehydrations.get(agentId) === promise) {
        this.pendingRehydrations.delete(agentId);
      }
    }
  }

  private async buildRehydratedAgent(agentId: string): Promise<Agent> {
    const bridge = this.multicastBridge;
    const record = await this.datastore.agent.read({ id: agentId });
    if (record.status === 'running') {
      await this.interrupt(agentId, 'rehydration requested running agent without active runtime');
      throw new Error(`Agent "${agentId}" was interrupted and cannot be rehydrated automatically.`);
    }
    if (record.status === 'interrupted' || record.status === 'offline' || record.status === 'failed') {
      throw new Error(`Agent "${agentId}" is ${record.status} and cannot be rehydrated.`);
    }
    const runtimeAgent = await rehydrateAgent({ agentId, bridge, datastore: this.datastore, logger: this.logger });
    this.installSignalRunner(runtimeAgent, agentId);
    installTaskBoardRunner({ agent: runtimeAgent, bridge, logger: this.logger, taskBoards: this.taskBoards });
    let inferenceProfileId: string | undefined;
    let integrationId: string | undefined;
    if (record.agentRegistryId !== null && record.agentRegistryId !== undefined) {
      const registry = await this.datastore.agentRegistries.read({ id: record.agentRegistryId });
      const specs = parseCapabilitySpecs(registry.capabilities, this.logger);
      const coordinator = this.getCoordinator();
      installSubAgentRunner({
        agent: runtimeAgent,
        agentId,
        agentRegistry: this,
        bridge,
        coordinator,
        logger: this.logger,
        specs,
      });
      if (record.parentAgentId !== null && record.parentAgentId !== undefined) {
        attachParentLinkCapability({
          agent: runtimeAgent,
          coordinator,
          mode: 'rehydrate',
          parentAgentId: record.parentAgentId,
        });
      }
      if (registry.kind !== 'framework' && registry.inferenceProfileId !== null) {
        const inferenceProfile = await this.datastore.inferenceProfiles.read({ id: registry.inferenceProfileId });
        inferenceProfileId = inferenceProfile.id;
        integrationId = inferenceProfile.integrationId;
      }
    }
    this.registerActiveAgent({
      agent: runtimeAgent,
      agentId,
      bridge,
      message: '',
      workspaceId: record.workspaceId,
      ...(inferenceProfileId === undefined ? {} : { inferenceProfileId }),
      ...(integrationId === undefined ? {} : { integrationId }),
    });
    return runtimeAgent;
  }

  private registerActiveAgent(input: RunAgentInput) {
    let orderId = Date.now();
    const nextOrderId = () => {
      orderId += 1;
      return orderId;
    };
    const context = buildAgentListenerContext({
      activeAgents: this.activeAgents,
      datastore: this.datastore,
      logger: this.logger,
      pending: this.subAgentCreatePromises,
      taskBoards: this.taskBoards,
      onStatusPersisted: (agentId, status) => {
        this.events.emit('agentStatusChanged', { agentId, status });
      },
    });
    installAgentPersistenceListeners({ context, input, nextOrderId });
    installSubAgentListeners({ context, input, nextOrderId });
    this.activeAgents.set(input.agentId, input.agent);
    const resumeMetadata = readResumeMetadata(input.agent);
    if (Object.keys(resumeMetadata).length > 0) {
      void persistAgentMetadata({
        agentId: input.agentId,
        bridge: input.bridge,
        datastore: this.datastore,
        logger: this.logger,
        metadata: resumeMetadata,
      });
    }
  }
  /**
   * Returns ids of every agent currently hot in this daemon.
   */
  public listActiveAgentIds(): string[] {
    return Array.from(this.activeAgents.keys());
  }

  /**
   * Wakes an agent when all currently-open signals have resolved.
   * Used by signal delivery paths so a waiting PebbleAgent can resume
   * immediately after inbound signal state changes.
   */
  public async wakeIfSignalsReady(agentId: string): Promise<void> {
    await repairBlockedSubAgentAskSignal({ agentId, datastore: this.datastore });
    const open = await this.datastore.agent.signals.listOpenForAgent({ agentId });
    if (open.items.length > 0) {
      return;
    }
    const received = await this.datastore.agent.signals.listReceivedForAgent({ agentId });
    if (received.items.length === 0) {
      return;
    }
    const record = await this.datastore.agent.read({ id: agentId });
    if (record.status !== 'waiting' && record.status !== 'idle') {
      return;
    }
    const agent = await this.rehydrate(agentId);
    if (agent instanceof PebbleAgent) {
      agent.resumeFromSignal();
    }
  }

  /**
   * Drops hot runtime state and resume metadata so next rehydrate starts
   * a fresh framework session under the same durable agent id.
   */
  public async freshStart(agentId: string): Promise<void> {
    this.deactivate(agentId);
    await this.datastore.agent.setMetadata({ id: agentId, metadata: '{}' });
  }

  /**
   * Launches a new runtime agent from a registry row.
   */
  public async launch(input: LaunchAgentInput) {
    const bridge = this.multicastBridge;
    const registry = await this.datastore.agentRegistries.read({ id: input.agentRegistryId });
    const buildInput = await resolveBuildInput(this.datastore, { registry });

    const launchWorkspace = await resolveLaunchWorkspace({
      bridge,
      datastore: this.datastore,
      logger: this.logger,
      multicastBridge: this.multicastBridge,
      registry,
    });
    const description = buildInput.description;
    const agent = await this.datastore.agent.create({
      agentRegistryId: registry.id,
      description,
      name: registry.name,
      ...(input.parentAgentId === undefined ? {} : { parentAgentId: input.parentAgentId }),
      workspaceId: launchWorkspace.workspace.id,
    });
    bridge.emit('agentRecorded', agent);

    if (launchWorkspace.worktree !== undefined) {
      await emitWorktreeInitializedTrace({
        agentId: agent.id,
        bridge,
        datastore: this.datastore,
        worktree: launchWorkspace.worktree,
      });
    }

    const runtimeAgent = buildLaunchAgent({
      ...buildInput.params,
      agentId: agent.id,
      resumeMetadata: {},
      workspacePath: launchWorkspace.workspace.path,
    });

    const profileIds =
      buildInput.params.kind === 'pebble'
        ? {
            inferenceProfileId: buildInput.params.inferenceProfile.id,
            integrationId: buildInput.params.integration.id,
          }
        : {};
    await this.runAgent({
      agent: runtimeAgent,
      agentId: agent.id,
      bridge,
      message: input.message,
      registry,
      ...(input.parentAgentId === undefined ? {} : { parentAgentId: input.parentAgentId }),
      ...(input.extraCapabilities === undefined ? {} : { extraCapabilities: input.extraCapabilities }),
      ...profileIds,
      workspaceId: launchWorkspace.workspace.id,
    }).catch((error) => {
      this.logger.warn('daemon agent failed', { agentId: agent.id, error });
      throw error;
    });

    return { id: agent.id };
  }

  private async runAgent(input: RunAgentInput) {
    this.registerActiveAgent(input);
    this.installSignalRunner(input.agent, input.agentId);
    installTaskBoardRunner({
      agent: input.agent,
      bridge: this.multicastBridge,
      logger: this.logger,
      taskBoards: this.taskBoards,
    });
    let coordinator: SubAgentCoordinator | undefined;
    if (input.registry !== undefined) {
      coordinator = this.getCoordinator();
      const registrySpecs = parseCapabilitySpecs(input.registry.capabilities, this.logger);
      const combinedSpecs =
        input.extraCapabilities === undefined ? registrySpecs : [...registrySpecs, ...input.extraCapabilities];
      installFreshLaunchAgent({
        agent: input.agent,
        agentId: input.agentId,
        agentRegistry: this,
        bridge: this.multicastBridge,
        coordinator,
        logger: this.logger,
        ...(input.parentAgentId === undefined ? {} : { parentAgentId: input.parentAgentId }),
        specs: combinedSpecs,
      });
    }
    if (input.parentAgentId !== undefined) {
      return;
    }
    input.agent.sendMessage([Cell.text(input.message)]);
  }

  private installSignalRunner(agent: Agent, agentId: string): void {
    installCapabilityRunners(agent, {
      signal: new DaemonSignalRunner({
        agentId,
        datastore: this.datastore,
        wake: (targetAgentId) => this.wakeIfSignalsReady(targetAgentId),
      }),
    });
  }
}
