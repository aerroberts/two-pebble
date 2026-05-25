import type { AgentSignalRecord } from '@two-pebble/datastore';
import {
  appendAgentReference,
  applyTodoStatus,
  extractAgentSystemPromptDocumentReferences,
  extractTodos,
  markdownToTipTap,
  parseDocumentReferences,
  serializeDocumentReferences,
  type TipTapDocument,
  tipTapToMarkdown,
} from '@two-pebble/datatypes';
import { logger } from '@two-pebble/logger';
import type {
  Agent,
  AgentBridge,
  AgentSignal,
  TaskBoardEventRecord,
  TaskBoardPoolNode,
  TaskBoardTaskNode,
  TaskStatus,
} from '@two-pebble/pebble';
import { Cell, PebbleAgent } from '@two-pebble/pebble';
import { DaemonService } from '../daemon-service';
import type { TaskBoardService } from '../task-board/service';
import { attachAgentNaming } from './agent-naming/attach-agent-naming';
import { resolveBuildInput } from './build-input';
import { buildLaunchAgent } from './build-launch-agent';
import { emitWorktreeInitializedTrace, resolveLaunchWorkspace } from './launch-workspace';
import { buildAgentListenerContext } from './listener-context';
import { installAgentPersistenceListeners, installSubAgentListeners } from './listeners';
import { parseCapabilitySpecs } from './register-pebble-capabilities';
import { renderAgentRegistrySystemPrompt } from './registry-system-prompt';
import { rehydrateAgent } from './rehydrate';
import { readResumeMetadata } from './resume-metadata';
import { repairBlockedSubAgentResultSignals, repairBlockedSubAgentResultSignalsForAgents } from './signal-repair';
import { interruptStaleRunningAgents, persistAgentMetadata } from './status';
import { installFreshLaunchAgent } from './sub-agent/install';
import { readSubAgentReferenceMap } from './sub-agent/sub-agent-references';
import type { AgentTerminateInput, SubAgentReferenceMap } from './sub-agent/sub-agent-types';
import type { SubAgentCreatePromiseMap } from './sub-agents';
import type { ExtraCapabilitySpec, LaunchAgentInput, RunAgentInput } from './types';

/**
 * Owns the lifecycle of every active runtime agent the daemon is managing.
 * Resolves an agent registry row into a runtime agent, hooks the durable
 * persistence listeners, and tracks active agents so handlers like
 * `callAgentTool` can look them up by id.
 */
export class AgentRegistryService extends DaemonService {
  public readonly id = 'agent-registry';
  private readonly activeAgents = new Map<string, Agent>();
  private readonly subAgentCreatePromises: SubAgentCreatePromiseMap = new Map();
  private readonly pendingRehydrations = new Map<string, Promise<Agent>>();

  private get datastore() {
    return this.daemon.datastore;
  }

  private get taskBoards(): TaskBoardService {
    return this.daemon.requireService<TaskBoardService>('task-board');
  }

  /**
   * Marks a child stopped and removes its hot runtime object.
   */
  public async terminate(input: AgentTerminateInput): Promise<void> {
    this.deactivate(input.agentId);
    const updated = await this.datastore.agent.setStatus({ id: input.agentId, status: 'offline' });
    this.daemon.events.emit('agentRecorded', updated);
  }

  /**
   * Audits durable lifecycle state at daemon boot. A runtime agent cannot
   * survive process restart, so any persisted running row is interrupted.
   * After repair, sweeps every waiting/idle agent to wake any whose signals
   * are already satisfied — catches deadlocks where a child finished and
   * delivered a response while the daemon was down (or while a pre-fix
   * code path bypassed the wake).
   */
  public override async initialize(): Promise<void> {
    await interruptStaleRunningAgents({ datastore: this.datastore });
    await repairBlockedSubAgentResultSignalsForAgents({ agentRegistry: this, datastore: this.datastore });
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
        logger.warn('hydrate wake audit failed', { agentId: agent.id, error: message });
      }
    }
    logger.info('hydrate wake audit complete', { scanned: candidates.length, woken });
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
    this.daemon.events.emit('agentRecorded', updated);
    logger.warn('agent interrupted', { agentId, reason });
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
        logger.warn('runtime stop failed', { agentId, error: message });
      }
    }
    this.deactivate(agentId);
    const updated = await this.datastore.agent.setStatus({ id: agentId, status: 'idle' });
    this.daemon.events.emit('agentRecorded', updated);
    try {
      const sync = await this.taskBoards.syncOwnedTasksFromAgentStatus({
        agentId,
        agentStatus: 'idle',
        reason: `auto: agent ${updated.name} stopped (${reason})`,
      });
      for (const event of sync.events) {
        this.daemon.events.emit('taskEventRecorded', event);
      }
      for (const task of sync.tasks) {
        this.daemon.events.emit('taskUpdated', task);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn('task status sync from stopped agent failed', { agentId, error: message });
    }
    logger.info('agent stopped', { agentId, reason });
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
    const record = await this.datastore.agent.read({ id: agentId });
    if (record.status === 'running') {
      await this.interrupt(agentId, 'rehydration requested running agent without active runtime');
      throw new Error(`Agent "${agentId}" was interrupted and cannot be rehydrated automatically.`);
    }
    if (record.status === 'interrupted' || record.status === 'offline' || record.status === 'failed') {
      throw new Error(`Agent "${agentId}" is ${record.status} and cannot be rehydrated.`);
    }
    let references: SubAgentReferenceMap = new Map();
    if (record.agentRegistryId !== null && record.agentRegistryId !== undefined) {
      const registry = await this.datastore.agentRegistries.read({ id: record.agentRegistryId });
      references = readSubAgentReferenceMap(parseCapabilitySpecs(registry.capabilities));
    }
    const runtimeAgent = await rehydrateAgent({
      agentBridge: this.buildAgentBridge(agentId, references),
      agentId,
      datastore: this.datastore,
    });
    attachAgentNaming({
      agent: runtimeAgent,
      mode: 'rehydrate',
    });
    let inferenceProfileId: string | undefined;
    let integrationId: string | undefined;
    if (record.agentRegistryId !== null && record.agentRegistryId !== undefined) {
      const registry = await this.datastore.agentRegistries.read({ id: record.agentRegistryId });
      if (registry.kind !== 'framework' && registry.inferenceProfileId !== null) {
        const inferenceProfile = await this.datastore.inferenceProfiles.read({ id: registry.inferenceProfileId });
        inferenceProfileId = inferenceProfile.id;
        integrationId = inferenceProfile.integrationId;
      }
    }
    this.registerActiveAgent({
      agent: runtimeAgent,
      agentId,
      events: this.daemon.events,
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
      pending: this.subAgentCreatePromises,
      taskBoards: this.taskBoards,
      onStatusPersisted: () => undefined,
    });
    installAgentPersistenceListeners({ context, input, nextOrderId });
    installSubAgentListeners({ context, input, nextOrderId });
    this.activeAgents.set(input.agentId, input.agent);
    if (input.agent instanceof PebbleAgent) {
      input.agent.initializeSystemPrompt();
    }
    const resumeMetadata = readResumeMetadata(input.agent);
    if (Object.keys(resumeMetadata).length > 0) {
      void persistAgentMetadata({
        agentId: input.agentId,
        events: input.events,
        datastore: this.datastore,
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
    await repairBlockedSubAgentResultSignals({ agentId, datastore: this.datastore });
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
    const registry = await this.datastore.agentRegistries.read({ id: input.agentRegistryId });
    const buildInput = await resolveBuildInput(this.datastore, { registry });

    const launchWorkspace = await resolveLaunchWorkspace({
      events: this.daemon.events,
      datastore: this.datastore,
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
    this.daemon.events.emit('agentRecorded', agent);

    if (launchWorkspace.worktree !== undefined) {
      await emitWorktreeInitializedTrace({
        agentId: agent.id,
        events: this.daemon.events,
        datastore: this.datastore,
        worktree: launchWorkspace.worktree,
      });
    }

    const combinedExtras = combineLaunchExtras(registry.systemPrompt, input.extraCapabilities);
    const combinedSpecs = mergeCapabilitySpecs(parseCapabilitySpecs(registry.capabilities), combinedExtras);
    const systemPrompt = await renderAgentRegistrySystemPrompt({
      agentId: agent.id,
      datastore: this.datastore,
      kind: buildInput.params.kind,
      systemPrompt: registry.systemPrompt,
    });
    const runtimeAgent = buildLaunchAgent({
      ...buildInput.params,
      agentId: agent.id,
      bridge: this.buildAgentBridge(agent.id, readSubAgentReferenceMap(combinedSpecs)),
      resumeMetadata: {},
      systemPrompt,
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
      events: this.daemon.events,
      message: input.message,
      ...(input.cells === undefined ? {} : { cells: input.cells }),
      registry,
      ...(input.parentAgentId === undefined ? {} : { parentAgentId: input.parentAgentId }),
      ...(combinedExtras === undefined ? {} : { extraCapabilities: combinedExtras }),
      ...profileIds,
      workspaceId: launchWorkspace.workspace.id,
    }).catch((error) => {
      logger.warn('daemon agent failed', { agentId: agent.id, error });
      throw error;
    });

    return { id: agent.id };
  }

  private async runAgent(input: RunAgentInput) {
    this.registerActiveAgent(input);
    attachAgentNaming({
      agent: input.agent,
      mode: 'fresh',
    });
    if (input.registry !== undefined) {
      const registrySpecs = parseCapabilitySpecs(input.registry.capabilities);
      const combinedSpecs = mergeCapabilitySpecs(registrySpecs, input.extraCapabilities);
      installFreshLaunchAgent({
        agent: input.agent,
        specs: combinedSpecs,
      });
    }
    if (input.parentAgentId !== undefined) {
      return;
    }
    const cells = input.cells !== undefined && input.cells.length > 0 ? input.cells : [Cell.text(input.message)];
    input.agent.sendMessage(cells);
  }

  private buildAgentBridge(agentId: string, references: SubAgentReferenceMap): AgentBridge {
    return {
      agent: {
        setName: async (input) => {
          const record = await this.datastore.agent.rename({ id: agentId, name: input.name });
          this.daemon.events.emit('agentRecorded', {
            agentRegistryId: record.agentRegistryId ?? null,
            completedAt: record.completedAt,
            description: record.description,
            id: record.id,
            metadata: record.metadata,
            name: record.name,
            parentAgentId: record.parentAgentId ?? null,
            startedAt: record.startedAt,
            status: record.status,
          });
        },
      },
      documents: {
        applyTodoStatus: async (input) => {
          const existing = await this.datastore.documents.read({ id: input.id });
          const parsed = JSON.parse(existing.content) as TipTapDocument;
          const next = applyTodoStatus(parsed, input.todoId, input.status, input.completionType);
          if (next === parsed) {
            return;
          }
          const nextRefs = appendAgentReference(parseDocumentReferences(existing.references), agentId, Date.now());
          const record = await this.datastore.documents.update({
            id: input.id,
            content: JSON.stringify(next),
            references: serializeDocumentReferences(nextRefs),
          });
          this.daemon.events.emit('documentUpdated', record);
        },
        create: async (input) => {
          const content = JSON.stringify(markdownToTipTap(input.markdown));
          const references = serializeDocumentReferences(appendAgentReference([], agentId, Date.now()));
          const record = await this.datastore.documents.create({ name: input.name, content, references });
          this.daemon.events.emit('documentUpdated', record);
          return { id: record.id, name: record.name };
        },
        list: async (input) => {
          const result = await this.datastore.documents.list({
            limit: input.limit ?? 50,
            offset: input.offset ?? 0,
          });
          return {
            items: result.items.map((item) => ({ id: item.id, name: item.name, updatedAt: item.updatedAt })),
            total: result.page.total,
          };
        },
        read: async (input) => {
          const record = await this.datastore.documents.read({ id: input.id });
          const tipTap = JSON.parse(record.content) as TipTapDocument;
          return { id: record.id, name: record.name, markdown: tipTapToMarkdown(tipTap) };
        },
        readTodos: async (input) => {
          const record = await this.datastore.documents.read({ id: input.id });
          const tipTap = JSON.parse(record.content) as TipTapDocument;
          return extractTodos(tipTap);
        },
        update: async (input) => {
          const existing = await this.datastore.documents.read({ id: input.id });
          const nextRefs = appendAgentReference(parseDocumentReferences(existing.references), agentId, Date.now());
          const content = JSON.stringify(markdownToTipTap(input.markdown));
          const record = await this.datastore.documents.update({
            id: input.id,
            content,
            ...(input.name === undefined ? {} : { name: input.name }),
            references: serializeDocumentReferences(nextRefs),
          });
          this.daemon.events.emit('documentUpdated', record);
          return { id: record.id, name: record.name };
        },
      },
      signals: {
        markResolved: async (input) => {
          await this.datastore.agent.signals.markResolved({ id: input.id });
        },
        register: async (input) => {
          const signalId = input.signalId ?? crypto.randomUUID();
          await this.datastore.agent.signals.register({
            agentId,
            capabilityId: input.capabilityId,
            description: input.description,
            name: input.name,
            signalId,
          });
          return signalId;
        },
        resolve: async (input) => {
          await this.datastore.agent.signals.resolve(input);
          await this.wakeIfSignalsReady(input.agentId);
        },
        send: async (input) => {
          await this.datastore.agent.signals.sendPush({
            agentId: input.agentId,
            capabilityId: input.capabilityId,
            data: input.data,
            description: input.description,
            name: input.name,
            signalId: input.signalId ?? crypto.randomUUID(),
          });
          await this.wakeIfSignalsReady(input.agentId);
        },
        snapshot: async (input) => {
          const [openAwaited, received] = await Promise.all([
            this.datastore.agent.signals.listOpenForAgent({ agentId: input.agentId }),
            this.datastore.agent.signals.listReceivedForAgent({ agentId: input.agentId }),
          ]);
          return {
            openAwaited: openAwaited.items.map(toAgentSignal),
            received: received.items.map(toAgentSignal),
          };
        },
      },
      subAgents: {
        kill: async (input) => {
          await this.terminate({ agentId: input.childAgentId, reason: input.reason });
        },
        spawn: async (input) => {
          const agentRegistryId = references.get(input.subAgentId);
          if (agentRegistryId === undefined) {
            throw new Error(`Unknown sub-agent reference: ${input.subAgentId}`);
          }
          const launched = await this.launch({
            agentRegistryId,
            extraCapabilities: [
              {
                id: input.mode === 'task' ? 'parent-linked-task' : 'parent-linked-teammate',
                config: { childName: input.name, parentAgentId: agentId },
              },
            ],
            message: '',
            parentAgentId: agentId,
          });
          return launched.id;
        },
      },
      taskBoards: {
        addDependency: async (input) => {
          const { result, events } = await this.taskBoards.createDependency({
            boardId: input.boardId,
            fromId: input.fromTaskId,
            toId: input.toTaskId,
          });
          this.broadcastTaskEvents(events);
          this.daemon.events.emit('taskDependencyUpdated', result);
        },
        createPool: async (input) => {
          const record = await this.taskBoards.createPool({
            boardId: input.boardId,
            parentPoolId: input.parentPoolId ?? null,
            name: input.name,
            dependsOn: input.dependsOn ?? [],
          });
          this.daemon.events.emit('taskPoolUpdated', record);
          return { id: record.id };
        },
        createTask: async (input) => {
          const { result, events } = await this.taskBoards.createTask({
            boardId: input.boardId,
            name: input.name,
            description: input.description ?? '',
            poolId: input.poolId ?? null,
            dependsOn: input.dependsOn ?? [],
          });
          this.broadcastTaskEvents(events);
          this.daemon.events.emit('taskUpdated', result);
          const deliverables = await this.taskBoards.listTaskDeliverables(result.id);
          for (const deliverable of deliverables.items) {
            this.daemon.events.emit('taskDeliverableUpdated', deliverable);
          }
          return { id: result.id };
        },
        deleteDependency: async (input) => {
          const events = await this.taskBoards.deleteDependency(input.boardId, {
            fromId: input.fromTaskId,
            toId: input.toTaskId,
          });
          this.broadcastTaskEvents(events);
          this.daemon.events.emit('taskDependencyDeleted', {
            boardId: input.boardId,
            fromId: input.fromTaskId,
            toId: input.toTaskId,
          });
        },
        deletePool: async (input) => {
          const events = await this.taskBoards.deletePool(input.boardId, input.poolId);
          this.broadcastTaskEvents(events);
          this.daemon.events.emit('taskPoolDeleted', { id: input.poolId, boardId: input.boardId });
        },
        deleteTask: async (input) => {
          const events = await this.taskBoards.deleteTask(input.boardId, input.taskId);
          this.broadcastTaskEvents(events);
          this.daemon.events.emit('taskDeleted', { id: input.taskId, boardId: input.boardId });
          const refreshed = await this.taskBoards.listTasks(input.boardId);
          for (const task of refreshed) {
            this.daemon.events.emit('taskUpdated', task);
          }
        },
        describe: async (input) => {
          const snapshot = await this.taskBoards.readBoardSnapshot(input.boardId);
          return {
            boardId: snapshot.board.id,
            boardName: snapshot.board.name,
            pools: snapshot.pools.map(toPool),
            tasks: snapshot.tasks.map(toTask),
            dependencies: snapshot.dependencies.map((edge) => ({ fromId: edge.fromId, toId: edge.toId })),
          };
        },
        listTaskDeliverableSubmissions: async (input) => {
          const { items } = await this.taskBoards.listTaskDeliverableSubmissions(input.taskId);
          return items;
        },
        listTaskDeliverables: async (input) => {
          const { items } = await this.taskBoards.listTaskDeliverables(input.taskId);
          return items;
        },
        listTaskEvents: async (input) => {
          const events = await this.taskBoards.listTaskEvents(input.taskId);
          return events.map(toTaskBoardEvent);
        },
        renameTask: async (input) => {
          const record = await this.taskBoards.renameTask(input.taskId, input.name);
          const refreshed = await this.taskBoards.listTasks(record.boardId);
          for (const task of refreshed) {
            this.daemon.events.emit('taskUpdated', task);
          }
        },
        setOwnedTaskStatus: async (input) => {
          const { result, events } = await this.taskBoards.setTaskStatusAsAgent(input);
          this.broadcastTaskEvents(events);
          this.daemon.events.emit('taskUpdated', result);
          const refreshed = await this.taskBoards.listTasks(result.boardId);
          for (const task of refreshed) {
            this.daemon.events.emit('taskUpdated', task);
          }
        },
        setTaskStatus: async (input) => {
          const { result, events } = await this.taskBoards.setTaskStatus(input.boardId, {
            id: input.taskId,
            status: input.status,
            reason: input.reason,
          });
          this.broadcastTaskEvents(events);
          this.daemon.events.emit('taskUpdated', result);
          const refreshed = await this.taskBoards.listTasks(input.boardId);
          for (const task of refreshed) {
            this.daemon.events.emit('taskUpdated', task);
          }
        },
        submitDeliverable: async (input) => {
          const submission = await this.taskBoards.submitDeliverableAsAgent(input);
          this.daemon.events.emit('taskDeliverableSubmissionRecorded', submission);
          return submission;
        },
        updateTaskDescription: async (input) => {
          const record = await this.taskBoards.updateTaskDescription(input.taskId, input.description);
          const refreshed = await this.taskBoards.listTasks(input.boardId ?? record.boardId);
          for (const task of refreshed) {
            this.daemon.events.emit('taskUpdated', task);
          }
        },
      },
    };
  }

  private broadcastTaskEvents(events: Array<{ taskId: string }>): void {
    for (const event of events) {
      this.daemon.events.emit('taskEventRecorded', event as never);
    }
  }
}

function toAgentSignal(record: AgentSignalRecord): AgentSignal {
  return {
    agentId: record.agentId,
    capabilityId: record.capabilityId,
    data: record.data,
    description: record.description,
    id: record.id,
    kind: record.kind,
    name: record.name,
    signalId: record.signalId,
    status: record.status,
  };
}

function toPool(record: { id: string; name: string; parentPoolId: string | null }): TaskBoardPoolNode {
  return { id: record.id, name: record.name, parentPoolId: record.parentPoolId };
}

function toTask(record: {
  description: string;
  effectiveStatus: string;
  id: string;
  name: string;
  ownerId: string | null;
  poolId: string | null;
  status: string;
}): TaskBoardTaskNode {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    poolId: record.poolId,
    status: record.status as TaskStatus,
    effectiveStatus: record.effectiveStatus as TaskStatus | 'blocked',
    ownerId: record.ownerId,
  };
}

function toTaskBoardEvent(event: TaskBoardEventRecord): TaskBoardEventRecord {
  const kind = event.kind === 'delegated' || event.kind === 'undelegated' ? event.kind : 'status';
  return {
    id: event.id,
    kind,
    taskId: event.taskId,
    reason: event.reason,
    createdAt: event.createdAt,
    ...(event.status === undefined ? {} : { status: event.status }),
    ...(event.agentId === undefined ? {} : { agentId: event.agentId }),
    ...(event.agentName === undefined ? {} : { agentName: event.agentName }),
  };
}

/**
 * Builds the effective launch-time extras list. The system prompt's
 * `documentMention` nodes seed an implicit `progressive-task-list`
 * binding so an agent whose prompt references a document with todos
 * gets the capability without the user having to configure it twice.
 *
 * Precedence (lower wins to higher):
 *   registry.capabilities < systemPrompt mentions < explicit launch extras
 *
 * The `mergeCapabilitySpecs` map dedupe means the last entry per id
 * wins; explicit launch extras are appended after the systemPrompt
 * binding so an editor-driven launch (which carries `sourceDocumentId`)
 * can still override the prompt's mention.
 */
function combineLaunchExtras(
  systemPrompt: TipTapDocument,
  explicit: ExtraCapabilitySpec[] | undefined,
): ExtraCapabilitySpec[] | undefined {
  const promptRefs = extractAgentSystemPromptDocumentReferences(systemPrompt);
  if (promptRefs.length === 0) {
    return explicit;
  }
  const fromPrompt: ExtraCapabilitySpec[] = [
    { id: 'progressive-task-list', config: { documentId: promptRefs[0].documentId } },
  ];
  if (explicit === undefined) {
    return fromPrompt;
  }
  return [...fromPrompt, ...explicit];
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
