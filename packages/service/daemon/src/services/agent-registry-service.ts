import type { Datastore } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import { generateBranchName } from '@two-pebble/names';
import type { Agent, PebbleJsonRecord } from '@two-pebble/pebble';
import { Cell } from '@two-pebble/pebble';
import type { AgentRegistryServiceContext, DaemonBridge } from '../types';
import { createWorktreeForRepository } from '../utils/worktrees/create-worktree';
import { recordConversationCell, recordModelCall, recordPriceLineItem } from './agent-recording';
import { resolveBuildInput } from './agent-registry-build-input';
import { rehydrateAgent } from './agent-registry-rehydrate';
import { persistAgentMetadata, persistAgentStatus } from './agent-registry-status';
import {
  ensureSubAgent,
  recordSubAgentTrace,
  recordSubAgentUsage,
  type SubAgentCreatePromiseMap,
  stopSubAgent,
} from './agent-registry-sub-agents';
import type {
  EmitWorktreeInitializedInput,
  LaunchAgentInput,
  NextAgentTraceOrderId,
  PersistAgentStatusInput,
  RecordConversationCellInput,
  RecordModelCallInput,
  RecordPriceLineItemInput,
  RecordTraceInput,
  ResolvedLaunchWorkspace,
  ResolveLaunchWorkspaceInput,
  RunAgentInput,
} from './agent-registry-types';
import { buildLaunchAgent } from './build-launch-agent';
import { parseWorkspaceConfig } from './parse-workspace-config';
import { parseCapabilitySpecs } from './register-pebble-capabilities';
import {
  attachParentLinkCapability,
  deliverInitialSpawnMessage,
  installFreshLaunchAgent,
  installSubAgentRunner,
} from './sub-agent/runner-installer';
import type { AgentTerminateInput } from './sub-agent/runner-types';
import { SubAgentCoordinator } from './sub-agent/sub-agent-coordinator';
import { installTaskBoardRunner } from './task-board-runner/install';
import type { TaskBoardService } from './task-board-service';

interface ResumeMetadataProvider {
  getResumeMetadata(): PebbleJsonRecord;
}

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

  /**
   * Resolves the lazily-constructed sub-agent coordinator. Bound to the
   * daemon-owned multicast bridge so coordinator broadcasts fan out to
   * every connected client regardless of which client triggered the call.
   */
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
   * Marks an agent stopped. Used by the kill-sub-agent tool to stop
   * a child mid-run; clears any active runtime instance and writes the
   * offline state to the durable record.
   */
  public async terminate(input: AgentTerminateInput): Promise<void> {
    this.activeAgents.delete(input.agentId);
    const updated = await this.datastore.agent.setStatus({ id: input.agentId, status: 'offline' });
    this.multicastBridge.emit('agentRecorded', updated);
  }

  /**
   * Boot-time entry point. Used to flip every running agent back to idle
   * before the reconciler took over; now a no-op kept for call-site
   * compatibility. The LivenessReconciler drives rehydration directly
   * from the DB intent on its tick, so durable intent (running) is
   * preserved across daemon restarts and the reconciler is responsible
   * for getting reality to match.
   */
  public async hydrate(): Promise<void> {
    return;
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
   * Returns the active runtime agent for an id, rebuilding it from durable
   * state if no live instance is cached. Concurrent calls for the same id
   * are coalesced so the framework adapter is only constructed once per miss.
   */
  public async rehydrate(agentId: string): Promise<Agent> {
    const cached = this.activeAgents.get(agentId);
    if (cached !== undefined) return cached;
    const inflight = this.pendingRehydrations.get(agentId);
    if (inflight !== undefined) return inflight;
    const promise = this.buildRehydratedAgent(agentId);
    this.pendingRehydrations.set(agentId, promise);
    try {
      return await promise;
    } finally {
      if (this.pendingRehydrations.get(agentId) === promise) this.pendingRehydrations.delete(agentId);
    }
  }

  private async buildRehydratedAgent(agentId: string): Promise<Agent> {
    const bridge = this.multicastBridge;
    const record = await this.datastore.agent.read({ id: agentId });
    const runtimeAgent = await rehydrateAgent({ agentId, bridge, datastore: this.datastore, logger: this.logger });
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
    // Seed the sequence with the current wall clock so a rehydrated agent's
    // new traces sort after the previous run's traces. orderId is not a
    // timestamp; the seed just guarantees the next session's first id is
    // greater than the prior session's last one. Increments stay monotonic.
    let orderId = Date.now();
    const nextOrderId = () => {
      orderId += 1;
      return orderId;
    };
    this.attachAgentPersistenceListeners(input, nextOrderId);
    this.attachSubAgentListeners(input, nextOrderId);
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
   * Returns ids of every agent the daemon is currently running.
   * Used by the status operation so tooling can route tool calls
   * to the daemon that actually owns the agent.
   */
  public listActiveAgentIds(): string[] {
    return Array.from(this.activeAgents.keys());
  }

  /**
   * Returns a snapshot of every currently-active runtime agent paired with
   * its id. Used by the liveness reconciler to call probe on each agent
   * once per tick. The returned array is a snapshot — mutating it has no
   * effect on the registry's internal map.
   */
  public snapshotActiveAgents(): { agentId: string; agent: Agent }[] {
    const snapshot: { agentId: string; agent: Agent }[] = [];
    for (const [agentId, agent] of this.activeAgents.entries()) {
      snapshot.push({ agentId, agent });
    }
    return snapshot;
  }

  /**
   * Drops the active runtime instance and clears resume metadata so the
   * next rehydration starts a fresh framework session under the same
   * durable agent id. Used as an escape hatch when an agent can no
   * longer be resumed (e.g. the framework session expired) and the user
   * has indicated they want to keep working under the same agent.
   */
  public async freshStart(agentId: string): Promise<void> {
    this.activeAgents.delete(agentId);
    this.pendingRehydrations.delete(agentId);
    await this.datastore.agent.setMetadata({ id: agentId, metadata: '{}' });
  }

  /**
   * Launches a new agent run from a registry row.
   * Resolves profile + integration + workspace, creates the agent record,
   * builds the runtime agent, wires durable listeners, and tracks the
   * agent until its lifecycle terminates.
   */
  public async launch(input: LaunchAgentInput) {
    const bridge = this.multicastBridge;
    const registry = await this.datastore.agentRegistries.read({ id: input.agentRegistryId });
    const buildInput = await resolveBuildInput(this.datastore, { registry });

    const launchWorkspace = await this.resolveLaunchWorkspace({ bridge, registry });
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
      await this.emitWorktreeInitializedTrace({
        agentId: agent.id,
        bridge,
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
    void this.runAgent({
      agent: runtimeAgent,
      agentId: agent.id,
      bridge,
      message: input.message,
      registry,
      ...(input.parentAgentId === undefined ? {} : { parentAgentId: input.parentAgentId }),
      ...profileIds,
      workspaceId: launchWorkspace.workspace.id,
    }).catch((error) => {
      this.logger.warn('daemon agent failed', { agentId: agent.id, error });
    });

    return { id: agent.id };
  }

  private async resolveLaunchWorkspace(input: ResolveLaunchWorkspaceInput): Promise<ResolvedLaunchWorkspace> {
    const config = parseWorkspaceConfig({ logger: this.logger, registry: input.registry });
    if (config.kind === 'none' && input.registry.kind === 'framework') {
      throw new Error('framework agents cannot launch with workspace kind "none"');
    }
    if (config.kind === 'none') {
      const workspace = await this.datastore.workspaces.create({ path: '', worktreeId: null });
      input.bridge.emit('workspaceUpdated', workspace);
      return { workspace };
    }
    if (config.kind === 'absolute') {
      const workspace = await this.datastore.workspaces.create({ path: config.path, worktreeId: null });
      input.bridge.emit('workspaceUpdated', workspace);
      return { workspace };
    }

    const repository = await this.datastore.repositories.read({ id: config.repositoryId });
    const branch = `agent/${generateBranchName()}`;
    const worktree = await createWorktreeForRepository(
      { multicastBridge: this.multicastBridge, datastore: this.datastore, logger: this.logger },
      { branch, repositoryId: repository.id },
    );
    const workspace = await this.datastore.workspaces.create({ path: worktree.path, worktreeId: worktree.id });
    input.bridge.emit('workspaceUpdated', workspace);
    return { workspace, worktree };
  }

  private async emitWorktreeInitializedTrace(input: EmitWorktreeInitializedInput) {
    const record = await this.datastore.agent.traces.record({
      agentId: input.agentId,
      data: {
        branch: input.worktree.branch,
        path: input.worktree.path,
        repositoryId: input.worktree.repositoryId,
        worktreeId: input.worktree.id,
      },
      id: crypto.randomUUID(),
      orderId: 0,
      type: 'worktree-initialized',
    });
    input.bridge.emit('agentTraceRecorded', record);
  }

  private async runAgent(input: RunAgentInput) {
    this.registerActiveAgent(input);
    installTaskBoardRunner({
      agent: input.agent,
      bridge: this.multicastBridge,
      logger: this.logger,
      taskBoards: this.taskBoards,
    });
    let coordinator: SubAgentCoordinator | undefined;
    if (input.registry !== undefined) {
      coordinator = this.getCoordinator();
      installFreshLaunchAgent({
        agent: input.agent,
        agentId: input.agentId,
        agentRegistry: this,
        bridge: this.multicastBridge,
        coordinator,
        logger: this.logger,
        ...(input.parentAgentId === undefined ? {} : { parentAgentId: input.parentAgentId }),
        specs: parseCapabilitySpecs(input.registry.capabilities, this.logger),
      });
    }
    if (input.parentAgentId !== undefined && coordinator !== undefined) {
      const childAgentId = input.agentId;
      await deliverInitialSpawnMessage({
        childAgentId,
        coordinator,
        message: input.message,
        parentAgentId: input.parentAgentId,
      });
      return;
    }
    input.agent.sendMessage([Cell.text(input.message)]);
  }

  private attachAgentPersistenceListeners(input: RunAgentInput, nextOrderId: NextAgentTraceOrderId) {
    input.agent.on('status', ({ status }) => {
      void this.persistAgentStatus({ agentId: input.agentId, bridge: input.bridge, status });
    });
    input.agent.on('metadata', (metadata) => {
      void persistAgentMetadata({
        agentId: input.agentId,
        bridge: input.bridge,
        datastore: this.datastore,
        logger: this.logger,
        metadata,
      });
    });
    input.agent.on('trace', (trace) => {
      this.recordTrace({
        agentId: input.agentId,
        bridge: input.bridge,
        orderId: nextOrderId(),
        trace,
        workspaceId: input.workspaceId,
      }).catch((error) => {
        this.logger.warn('daemon agent trace write failed', { agentId: input.agentId, error });
      });
    });
    const inferenceProfileId = input.inferenceProfileId;
    const integrationId = input.integrationId;
    input.agent.on('modelCall', (call) => {
      this.recordModelCall({
        agentId: input.agentId,
        bridge: input.bridge,
        call,
        ...(inferenceProfileId === undefined ? {} : { inferenceProfileId }),
        ...(integrationId === undefined ? {} : { integrationId }),
      }).catch((error) => {
        this.logger.warn('daemon agent model call write failed', { agentId: input.agentId, error });
      });
    });
    input.agent.on('threadMessage', (cell) => {
      this.recordConversationCell({ agentId: input.agentId, cell }).catch((error) => {
        this.logger.warn('daemon agent conversation cell write failed', { agentId: input.agentId, error });
      });
    });
    input.agent.on('lineItem', (lineItem) => {
      this.recordPriceLineItem({
        agentId: input.agentId,
        bridge: input.bridge,
        lineItem,
        ...(inferenceProfileId === undefined ? {} : { inferenceProfileId }),
        ...(integrationId === undefined ? {} : { integrationId }),
      }).catch((error) => {
        this.logger.warn('daemon agent price line item write failed', { agentId: input.agentId, error });
      });
    });
  }

  private attachSubAgentListeners(input: RunAgentInput, nextOrderId: NextAgentTraceOrderId) {
    const ctx = { datastore: this.datastore, pending: this.subAgentCreatePromises };
    const { agent, agentId, bridge, workspaceId } = input;
    const logger = this.logger;
    const warn = (message: string, error: Error) => logger.warn(message, { agentId, error });
    agent.on('subAgentStart', (event) => {
      ensureSubAgent(ctx, { bridge, event, parentAgentId: agentId, workspaceId }).catch((error) =>
        warn('daemon sub-agent create failed', error),
      );
    });
    agent.on('subAgentTrace', (event) => {
      recordSubAgentTrace(ctx, { bridge, event, orderId: nextOrderId(), parentAgentId: agentId, workspaceId }).catch(
        (error) => warn('daemon sub-agent trace write failed', error),
      );
    });
    agent.on('subAgentUsage', (event) => {
      recordSubAgentUsage(ctx, { bridge, event, parentAgentId: agentId, usage: event.usage, workspaceId }).catch(
        (error) => warn('daemon sub-agent usage write failed', error),
      );
    });
    agent.on('subAgentStop', (event) => {
      stopSubAgent(ctx, { bridge, event, parentAgentId: agentId, workspaceId }).catch((error) =>
        warn('daemon sub-agent stop failed', error),
      );
    });
  }

  private async persistAgentStatus(input: PersistAgentStatusInput): Promise<void> {
    await persistAgentStatus({
      ...input,
      activeAgents: this.activeAgents,
      datastore: this.datastore,
      logger: this.logger,
      taskBoards: this.taskBoards,
    });
  }

  private async recordTrace(input: RecordTraceInput) {
    if (input.trace.type === 'sub-agent-invoke') {
      await ensureSubAgent(
        { datastore: this.datastore, pending: this.subAgentCreatePromises },
        {
          bridge: input.bridge,
          event: {
            agentInstanceId: input.trace.data.agentInstanceId,
            agentTemplateId: input.trace.data.agentTemplateId,
          },
          parentAgentId: input.agentId,
          workspaceId: input.workspaceId,
        },
      );
    }
    const record = await this.datastore.agent.traces.record({
      ...input.trace,
      agentId: input.agentId,
      id: crypto.randomUUID(),
      orderId: input.orderId,
    });
    input.bridge.emit('agentTraceRecorded', record);
  }

  private async recordModelCall(input: RecordModelCallInput) {
    await recordModelCall(this.datastore, input);
  }

  private async recordConversationCell(input: RecordConversationCellInput) {
    await recordConversationCell(this.datastore, input);
  }

  private async recordPriceLineItem(input: RecordPriceLineItemInput) {
    await recordPriceLineItem(this.datastore, input);
  }
}

function readResumeMetadata(agent: Agent): PebbleJsonRecord {
  if ('getResumeMetadata' in agent && typeof agent.getResumeMetadata === 'function') {
    return (agent as Agent & ResumeMetadataProvider).getResumeMetadata();
  }
  return {};
}
