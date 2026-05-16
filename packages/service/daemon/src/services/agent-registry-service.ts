import type { Datastore } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type { Agent } from '@two-pebble/pebble';
import { Cell, FrameworkAgent, PebbleAgent } from '@two-pebble/pebble';
import { installCapabilityRunners } from '@two-pebble/pebble/capabilities';
import type { AgentRegistryServiceContext, DaemonBridge } from '../types';
import { attachAgentNaming } from './agent-naming/attach-agent-naming';
import { resolveBuildInput } from './agent-registry-build-input';
import { emitWorktreeInitializedTrace, resolveLaunchWorkspace } from './agent-registry-launch-workspace';
import { buildAgentListenerContext } from './agent-registry-listener-context';
import { installAgentPersistenceListeners, installSubAgentListeners } from './agent-registry-listeners';
import { rehydrateAgent } from './agent-registry-rehydrate';
import { repairBlockedSubAgentAskSignal, repairBlockedSubAgentAskSignals } from './agent-registry-signal-repair';
import { interruptStaleRunningAgents, persistAgentMetadata } from './agent-registry-status';
import type { SubAgentCreatePromiseMap } from './agent-registry-sub-agents';
import type { ExtraCapabilitySpec, LaunchAgentInput, RunAgentInput } from './agent-registry-types';
import { readResumeMetadata } from './agent-resume-metadata';
import { buildLaunchAgent } from './build-launch-agent';
import { installDocumentRunner } from './document-runner/install';
import { parseCapabilitySpecs } from './register-pebble-capabilities';
import { DaemonSignalRunner } from './signal-runner/daemon-signal-runner';
import {
  attachFrameworkParentLinkBridge,
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
  }

  /**
   * Audits durable lifecycle state at daemon boot. A runtime agent cannot
   * survive process restart, so any persisted running row is interrupted.
   * After repair, sweeps every waiting/idle agent to wake any whose signals
   * are already satisfied — catches deadlocks where a child finished and
   * delivered a response while the daemon was down (or while a pre-fix
   * code path bypassed the wake).
   */
  public async hydrate(): Promise<void> {
    await interruptStaleRunningAgents({ datastore: this.datastore, logger: this.logger });
    await repairBlockedSubAgentAskSignals({ agentRegistry: this, datastore: this.datastore });
    await this.wakeAgentsWithSatisfiedSignals();
  }

  /**
   * Walks waiting/idle agents and asks each one whether its open-signal set
   * is empty and a received signal is ready to consume. `wakeIfSignalsReady`
   * is a no-op for agents that aren't ready, so this is a cheap, idempotent
   * sweep — safe to run on every boot.
   */
  private async wakeAgentsWithSatisfiedSignals(): Promise<void> {
    const { items } = await this.datastore.agent.list({ limit: 1000, offset: 0 });
    const candidates = items.filter((row) => row.status === 'waiting' || row.status === 'idle');
    let woken = 0;
    for (const agent of candidates) {
      try {
        const before = await this.datastore.agent.read({ id: agent.id });
        await this.wakeIfSignalsReady(agent.id);
        const after = await this.datastore.agent.read({ id: agent.id });
        if (before.status !== after.status) {
          woken += 1;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn('hydrate wake audit failed', { agentId: agent.id, error: message });
      }
    }
    this.logger.info('hydrate wake audit complete', { scanned: candidates.length, woken });
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
    this.logger.warn('agent interrupted', { agentId, reason });
  }

  /**
   * Handles a manual stop request from a user. Forwards the request to the
   * runtime agent when it implements `stop`, flips the durable record to
   * `idle`, broadcasts the status change, and syncs any tasks the agent
   * still owns so they leave terminal limbo.
   *
   * Unlike a natural completion, the runtime is not allowed to linger:
   * the hot registry entry is dropped regardless of whether the framework
   * acknowledged the stop, mirroring `interrupt` / `terminate`. The status
   * hook chain (`agentRecorded` emit and task resync) runs in one place so
   * manual stops fire the same downstream effects as automated terminations.
   */
  public async stopManual(agentId: string, reason: string): Promise<void> {
    const active = this.activeAgents.get(agentId);
    if (active !== undefined && 'stop' in active && typeof active.stop === 'function') {
      try {
        await (active as Agent & { stop(reason: string): Promise<void> }).stop(reason);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn('runtime stop failed', { agentId, error: message });
      }
    }
    this.deactivate(agentId);
    const updated = await this.datastore.agent.setStatus({ id: agentId, status: 'idle' });
    this.multicastBridge.emit('agentRecorded', updated);
    try {
      const sync = await this.taskBoards.syncOwnedTasksFromAgentStatus({
        agentId,
        agentStatus: 'idle',
        reason: `auto: agent ${updated.name} stopped (${reason})`,
      });
      for (const event of sync.events) {
        this.multicastBridge.emit('taskEventRecorded', event);
      }
      for (const task of sync.tasks) {
        this.multicastBridge.emit('taskUpdated', task);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn('task status sync from stopped agent failed', { agentId, error: message });
    }
    this.logger.info('agent stopped', { agentId, reason });
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
    attachAgentNaming({
      agent: runtimeAgent,
      agentId,
      datastore: this.datastore,
      mode: 'rehydrate',
      multicastBridge: this.multicastBridge,
    });
    installTaskBoardRunner({ agent: runtimeAgent, bridge, logger: this.logger, taskBoards: this.taskBoards });
    installDocumentRunner({
      agent: runtimeAgent,
      agentId,
      bridge,
      datastore: this.datastore,
      logger: this.logger,
    });
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
        attachFrameworkParentLinkBridge({
          agent: runtimeAgent,
          agentId,
          agentRegistry: this,
          datastore: this.datastore,
          logger: this.logger,
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
      onStatusPersisted: () => undefined,
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
   * immediately after inbound signal state changes. For framework agents
   * we instead translate the next received parent-link signal into an
   * input message — framework adapters have no `hookOnSignal` surface and
   * route everything through their plain message channel.
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
      return;
    }
    if (agent instanceof FrameworkAgent) {
      await this.deliverNextParentSignalToFramework(agent, agentId, received.items);
    }
  }

  /**
   * Routes the next pending parent-link push signal into a framework
   * agent. Stamps the agent's row with `parentResponseSignalId` so the
   * finalMessage bridge knows which awaited slot to resolve when the
   * framework eventually settles into idle, then marks the inbound signal
   * resolved so it isn't redelivered on rehydrate.
   */
  private async deliverNextParentSignalToFramework(
    agent: FrameworkAgent,
    agentId: string,
    received: Array<{ id: string; capabilityId: string; data: unknown }>,
  ): Promise<void> {
    const candidate = received.find((signal) => signal.capabilityId === 'parent-link');
    if (candidate === undefined) {
      return;
    }
    const data = candidate.data as { type?: string; message?: string; responseSignalId?: string } | null;
    if (data === null || typeof data !== 'object') {
      await this.datastore.agent.signals.markResolved({ id: candidate.id });
      return;
    }
    const message = typeof data.message === 'string' ? data.message : '';
    if (message.length === 0) {
      await this.datastore.agent.signals.markResolved({ id: candidate.id });
      return;
    }
    if (data.type === 'respond-parent' && typeof data.responseSignalId === 'string') {
      await this.datastore.agent.setParentResponseSignalId({
        id: agentId,
        parentResponseSignalId: data.responseSignalId,
      });
    }
    await this.datastore.agent.signals.markResolved({ id: candidate.id });
    agent.sendMessage([Cell.text(message)]);
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
      ...(input.cells === undefined ? {} : { cells: input.cells }),
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
    attachAgentNaming({
      agent: input.agent,
      agentId: input.agentId,
      datastore: this.datastore,
      mode: 'fresh',
      multicastBridge: this.multicastBridge,
    });
    installTaskBoardRunner({
      agent: input.agent,
      bridge: this.multicastBridge,
      logger: this.logger,
      taskBoards: this.taskBoards,
    });
    installDocumentRunner({
      agent: input.agent,
      agentId: input.agentId,
      bridge: this.multicastBridge,
      datastore: this.datastore,
      logger: this.logger,
    });
    let coordinator: SubAgentCoordinator | undefined;
    if (input.registry !== undefined) {
      coordinator = this.getCoordinator();
      const registrySpecs = parseCapabilitySpecs(input.registry.capabilities, this.logger);
      const combinedSpecs = mergeCapabilitySpecs(registrySpecs, input.extraCapabilities);
      installFreshLaunchAgent({
        agent: input.agent,
        agentId: input.agentId,
        agentRegistry: this,
        bridge: this.multicastBridge,
        coordinator,
        datastore: this.datastore,
        logger: this.logger,
        ...(input.parentAgentId === undefined ? {} : { parentAgentId: input.parentAgentId }),
        specs: combinedSpecs,
      });
    }
    if (input.parentAgentId !== undefined) {
      return;
    }
    const cells = input.cells !== undefined && input.cells.length > 0 ? input.cells : [Cell.text(input.message)];
    input.agent.sendMessage(cells);
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

/**
 * Combines registry-declared capability specs with launch-time extras,
 * deduping by id. When both sides declare the same capability, the extra
 * spec wins — its config replaces the registry's. This lets the document
 * editor's launch path stamp `documentId` onto an already-registered
 * `progressive-task-list` without producing a duplicate registration.
 */
function mergeCapabilitySpecs(
  registrySpecs: ExtraCapabilitySpec[],
  extras: ExtraCapabilitySpec[] | undefined,
): ExtraCapabilitySpec[] {
  if (extras === undefined || extras.length === 0) {
    return registrySpecs;
  }
  const extrasById = new Map(extras.map((spec) => [spec.id, spec]));
  const merged: ExtraCapabilitySpec[] = [];
  const seen = new Set<string>();
  for (const spec of registrySpecs) {
    const replacement = extrasById.get(spec.id);
    if (replacement !== undefined) {
      merged.push(replacement);
      seen.add(spec.id);
      continue;
    }
    merged.push(spec);
  }
  for (const extra of extras) {
    if (seen.has(extra.id)) {
      continue;
    }
    merged.push(extra);
  }
  return merged;
}
