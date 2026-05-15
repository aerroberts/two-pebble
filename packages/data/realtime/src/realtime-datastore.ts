import type { ClientProtocol } from '@two-pebble/protocol';
import { WsBridgeClient } from '@two-pebble/ws-bridge';
import { createStore } from 'zustand/vanilla';
import { listAgentCallsOperation } from './operations/agent.calls.list.operation';
import { readAgentCallOperation } from './operations/agent.calls.read.operation';
import { recordAgentCallOperation } from './operations/agent.calls.record.operation';
import { completeAgentOperation } from './operations/agent.complete.operation';
import { createAgentOperation } from './operations/agent.create.operation';
import { failAgentOperation } from './operations/agent.fail.operation';
import { freshStartAgentOperation } from './operations/agent.fresh-start.operation';
import { launchAgentOperation } from './operations/agent.launch.operation';
import { listAgentsOperation } from './operations/agent.list.operation';
import { sendAgentMessageOperation } from './operations/agent.message.operation';
import { listAgentPriceLineItemsOperation } from './operations/agent.price-line-items.list.operation';
import { recordAgentPriceLineItemOperation } from './operations/agent.price-line-items.record.operation';
import { readAgentOperation } from './operations/agent.read.operation';
import { renameAgentOperation } from './operations/agent.rename.operation';
import { resumeAgentOperation } from './operations/agent.resume.operation';
import { stopAgentOperation } from './operations/agent.stop.operation';
import { listAgentTracesOperation } from './operations/agent.traces.list.operation';
import { recordAgentTraceOperation } from './operations/agent.traces.record.operation';
import { createAgentRegistryOperation } from './operations/agent-registries.create.operation';
import { deleteAgentRegistryOperation } from './operations/agent-registries.delete.operation';
import { listAgentRegistriesOperation } from './operations/agent-registries.list.operation';
import { updateAgentRegistryOperation } from './operations/agent-registries.update.operation';
import { readAppSettingsOperation } from './operations/app-settings.read.operation';
import { updateAppSettingsOperation } from './operations/app-settings.update.operation';
import { createAutomationOperation } from './operations/automations.create.operation';
import { deleteAutomationOperation } from './operations/automations.delete.operation';
import { listAutomationsOperation } from './operations/automations.list.operation';
import { runAutomationNowOperation } from './operations/automations.run-now.operation';
import { updateAutomationOperation } from './operations/automations.update.operation';
import { describeDatabaseOperation } from './operations/database.describe.operation';
import { migrateDatabaseOperation } from './operations/database.migrate.operation';
import { openDatabaseOperation } from './operations/database.open.operation';
import { runDatabaseQueryOperation } from './operations/database.query.operation';
import { listDebugLogsOperation } from './operations/debug.logs.list.operation';
import { openDebugLogOperation } from './operations/debug.logs.open.operation';
import { openDebugLogsDirectoryOperation } from './operations/debug.logs.open-directory.operation';
import { readDebugLogOperation } from './operations/debug.logs.read.operation';
import { createDocumentOperation } from './operations/documents.create.operation';
import { deleteDocumentOperation } from './operations/documents.delete.operation';
import { listDocumentsOperation } from './operations/documents.list.operation';
import { readDocumentOperation } from './operations/documents.read.operation';
import { updateDocumentOperation } from './operations/documents.update.operation';
import { generateSpeechOperation } from './operations/generate-speech.operation';
import { listHeartbeatsOperation } from './operations/heartbeats.list.operation';
import { createInferenceProfileOperation } from './operations/inference-profiles.create.operation';
import { deleteInferenceProfileOperation } from './operations/inference-profiles.delete.operation';
import { listInferenceProfilesOperation } from './operations/inference-profiles.list.operation';
import { updateInferenceProfileOperation } from './operations/inference-profiles.update.operation';
import { createIntegrationOperation } from './operations/integrations.create.operation';
import { deleteIntegrationOperation } from './operations/integrations.delete.operation';
import { listIntegrationsOperation } from './operations/integrations.list.operation';
import { updateIntegrationOperation } from './operations/integrations.update.operation';
import { listMetricNamesOperation } from './operations/metrics.list-names.operation';
import { listMetricVariantsOperation } from './operations/metrics.list-variants.operation';
import { queryMetricsAggregatedOperation } from './operations/metrics.query-aggregated.operation';
import { createRepositoryOperation } from './operations/repositories.create.operation';
import { deleteRepositoryOperation } from './operations/repositories.delete.operation';
import { listRepositoriesOperation } from './operations/repositories.list.operation';
import { updateRepositoryOperation } from './operations/repositories.update.operation';
import { createTaskBoardOperation } from './operations/task-boards.create.operation';
import { deleteTaskBoardOperation } from './operations/task-boards.delete.operation';
import { listTaskBoardsOperation } from './operations/task-boards.list.operation';
import { updateTaskBoardOperation } from './operations/task-boards.update.operation';
import { listTaskDeliverableSubmissionsOperation } from './operations/task-deliverable-submissions.list.operation';
import { listTaskDeliverablesOperation } from './operations/task-deliverables.list.operation';
import { createTaskDependencyOperation } from './operations/task-dependencies.create.operation';
import { deleteTaskDependencyOperation } from './operations/task-dependencies.delete.operation';
import { listTaskDependenciesOperation } from './operations/task-dependencies.list.operation';
import { listTaskDispatchSettingsOperation } from './operations/task-dispatch-settings.list.operation';
import { readTaskDispatchSettingsOperation } from './operations/task-dispatch-settings.read.operation';
import { updateTaskDispatchSettingsOperation } from './operations/task-dispatch-settings.update.operation';
import { listTaskEventsOperation } from './operations/task-events.list.operation';
import { createTaskPoolOperation } from './operations/task-pools.create.operation';
import { deleteTaskPoolOperation } from './operations/task-pools.delete.operation';
import { listTaskPoolsOperation } from './operations/task-pools.list.operation';
import { createTaskTemplateDeliverableOperation } from './operations/task-template-deliverables.create.operation';
import { deleteTaskTemplateDeliverableOperation } from './operations/task-template-deliverables.delete.operation';
import { listTaskTemplateDeliverablesOperation } from './operations/task-template-deliverables.list.operation';
import { updateTaskTemplateDeliverableOperation } from './operations/task-template-deliverables.update.operation';
import { createTaskTemplateOperation } from './operations/task-templates.create.operation';
import { deleteTaskTemplateOperation } from './operations/task-templates.delete.operation';
import { listTaskTemplatesOperation } from './operations/task-templates.list.operation';
import { updateTaskTemplateOperation } from './operations/task-templates.update.operation';
import { createTaskOperation } from './operations/tasks.create.operation';
import { delegateTaskOperation } from './operations/tasks.delegate.operation';
import { deleteTaskOperation } from './operations/tasks.delete.operation';
import { listTasksOperation } from './operations/tasks.list.operation';
import { renameTaskOperation } from './operations/tasks.rename.operation';
import { undelegateTaskOperation } from './operations/tasks.undelegate.operation';
import { setTaskStatusOperation } from './operations/tasks.update.operation';
import { updateTaskDescriptionOperation } from './operations/tasks.update-description.operation';
import { createThirdPartyAgentInstallOperation } from './operations/third-party-agent-installs.create.operation';
import { deleteThirdPartyAgentInstallOperation } from './operations/third-party-agent-installs.delete.operation';
import { detectClaudeCodeInstallOperation } from './operations/third-party-agent-installs.detect-claude-code.operation';
import { listThirdPartyAgentInstallsOperation } from './operations/third-party-agent-installs.list.operation';
import { updateThirdPartyAgentInstallOperation } from './operations/third-party-agent-installs.update.operation';
import { readThreadSnapshotOperation } from './operations/thread.snapshot.read.operation';
import { listThreadsOperation } from './operations/threads.list.operation';
import { transcribeAudioOperation } from './operations/transcribe-audio.operation';
import { listWorkspacesOperation } from './operations/workspaces.list.operation';
import { createWorktreeOperation } from './operations/worktrees.create.operation';
import { deleteWorktreeOperation } from './operations/worktrees.delete.operation';
import { listWorktreesOperation } from './operations/worktrees.list.operation';
import { openWorktreeOperation } from './operations/worktrees.open.operation';
import type { RealtimeState } from './state';
import { createRealtimeState } from './state';
import { listenToAgentCalls } from './states/agent-calls/listen';
import { listenToAgentLiveness } from './states/agent-liveness/listen';
import { listenToAgentPriceLineItems } from './states/agent-price-line-items/listen';
import { listenToAgentRegistries } from './states/agent-registries/listen';
import { listenToAgentTraces } from './states/agent-traces/listen';
import { listenToAgents } from './states/agents/listen';
import { listenToAppSettings } from './states/app-settings/listen';
import { listenToAutomations } from './states/automations/listen';
import { listenToDebugLogs } from './states/debug-logs/listen';
import { listenToDocuments } from './states/documents/listen';
import { listenToInferenceProfiles } from './states/inference-profiles/listen';
import { listenToIntegrations } from './states/integrations/listen';
import { listenToRepositories } from './states/repositories/listen';
import { listenToTasks } from './states/tasks/listen';
import { listenToThirdPartyAgentInstalls } from './states/third-party-agent-installs/listen';
import { listenToWorkspaces } from './states/workspaces/listen';
import { listenToWorktrees } from './states/worktrees/listen';
import type {
  RealtimeClient,
  RealtimeClosedHandler,
  RealtimeClosedHandlerOrNull,
  RealtimeDatastoreInput,
  RealtimeEmitName,
  RealtimeEmitOptions,
  RealtimeEmitPayload,
  RealtimeEmitResponse,
  RealtimeOperationErrorHandler,
  RealtimeOperationErrorHandlerOrNull,
  RealtimeStateStore,
} from './types';

/**
 * Owns the realtime daemon connection and observable client state.
 * The Zustand store is only state, while this class owns connection behavior.
 * Feature states bind protocol operations through wrapEmit instead of root actions.
 */
export class RealtimeDatastore {
  private readonly input: RealtimeDatastoreInput;
  private connectionClosedHandler: RealtimeClosedHandlerOrNull = null;
  private currentClient: RealtimeClient = null;
  private operationErrorHandler: RealtimeOperationErrorHandlerOrNull = null;
  public readonly store: RealtimeStateStore<RealtimeState>;

  public constructor(input: RealtimeDatastoreInput) {
    this.input = input;
    this.store = createStore<RealtimeState>(() => createRealtimeState());
  }

  /**
   * Returns the current realtime state snapshot.
   * This is intended for operation modules that need existing loadables.
   * React rendering should read through hooks and selectors.
   */
  public get state(): RealtimeState {
    return this.store.getState();
  }

  /**
   * Returns the active websocket client.
   * The client is connection mechanics, not observable application state.
   * State modules read it when binding listeners or sending operations.
   */
  public get client(): RealtimeClient {
    return this.currentClient;
  }

  /**
   * Returns integration operations bound to this realtime datastore.
   * Hooks consume this surface instead of constructing operations themselves.
   * This mirrors the durable datastore proxy style.
   */
  public get integrations() {
    return {
      create: createIntegrationOperation({ datastore: this }),
      delete: deleteIntegrationOperation({ datastore: this }),
      list: listIntegrationsOperation({ datastore: this }),
      update: updateIntegrationOperation({ datastore: this }),
    };
  }

  /**
   * Returns third-party agent install operations bound to this datastore.
   * Each install is a record of one framework binary available on the local
   * machine (e.g. a `claude` executable). Many installs per framework are
   * allowed.
   */
  public get thirdPartyAgentInstalls() {
    return {
      create: createThirdPartyAgentInstallOperation({ datastore: this }),
      delete: deleteThirdPartyAgentInstallOperation({ datastore: this }),
      detectClaudeCode: detectClaudeCodeInstallOperation({ datastore: this }),
      list: listThirdPartyAgentInstallsOperation({ datastore: this }),
      update: updateThirdPartyAgentInstallOperation({ datastore: this }),
    };
  }

  /**
   * Returns agent registry operations bound to this realtime datastore.
   * Each registry row binds an inference profile + system prompt that the
   * launch flow consumes when starting an agent.
   */
  public get agentRegistries() {
    return {
      create: createAgentRegistryOperation({ datastore: this }),
      delete: deleteAgentRegistryOperation({ datastore: this }),
      list: listAgentRegistriesOperation({ datastore: this }),
      update: updateAgentRegistryOperation({ datastore: this }),
    };
  }

  public get automations() {
    return {
      create: createAutomationOperation({ datastore: this }),
      delete: deleteAutomationOperation({ datastore: this }),
      list: listAutomationsOperation({ datastore: this }),
      runNow: runAutomationNowOperation({ datastore: this }),
      update: updateAutomationOperation({ datastore: this }),
    };
  }

  public get heartbeats() {
    return {
      list: listHeartbeatsOperation({ datastore: this }),
    };
  }

  /**
   * Returns repository operations bound to this realtime datastore.
   * Repositories are pointers to local git clones; worktrees derive from them.
   */
  public get repositories() {
    return {
      create: createRepositoryOperation({ datastore: this }),
      delete: deleteRepositoryOperation({ datastore: this }),
      list: listRepositoriesOperation({ datastore: this }),
      update: updateRepositoryOperation({ datastore: this }),
    };
  }

  /**
   * Returns document operations bound to this realtime datastore.
   * Documents are cached as serialized TipTap JSON records.
   */
  public get documents() {
    return {
      create: createDocumentOperation({ datastore: this }),
      delete: deleteDocumentOperation({ datastore: this }),
      list: listDocumentsOperation({ datastore: this }),
      read: readDocumentOperation({ datastore: this }),
      update: updateDocumentOperation({ datastore: this }),
    };
  }

  /**
   * Returns worktree operations bound to this realtime datastore.
   * Create awaits the daemon's full git worktree add lifecycle.
   * Lifecycle transitions are also delivered as worktreeUpdated events.
   */
  public get worktrees() {
    return {
      create: createWorktreeOperation({ datastore: this }),
      delete: deleteWorktreeOperation({ datastore: this }),
      list: listWorktreesOperation({ datastore: this }),
      open: openWorktreeOperation({ datastore: this }),
    };
  }

  /**
   * Returns workspace operations bound to this realtime datastore.
   * Workspaces are the on-disk path the agent operates within and
   * optionally point at a worktree.
   */
  public get workspaces() {
    return {
      list: listWorkspacesOperation({ datastore: this }),
    };
  }

  /**
   * Returns task-board operations bound to this realtime datastore.
   * Boards own pools, tasks, and dependencies; the daemon validates each
   * mutation through the in-memory engine before persisting.
   */
  public get taskBoards() {
    return {
      create: createTaskBoardOperation({ datastore: this }),
      delete: deleteTaskBoardOperation({ datastore: this }),
      list: listTaskBoardsOperation({ datastore: this }),
      update: updateTaskBoardOperation({ datastore: this }),
    };
  }

  /**
   * Returns pool operations bound to this realtime datastore.
   * Pools nest under boards (or other pools) and group tasks for resolution.
   */
  public get taskPools() {
    return {
      create: createTaskPoolOperation({ datastore: this }),
      delete: deleteTaskPoolOperation({ datastore: this }),
      list: listTaskPoolsOperation({ datastore: this }),
    };
  }

  /**
   * Returns task operations bound to this realtime datastore.
   * Status updates traverse the engine so dependent tasks unblock automatically.
   */
  public get tasks() {
    return {
      create: createTaskOperation({ datastore: this }),
      delete: deleteTaskOperation({ datastore: this }),
      list: listTasksOperation({ datastore: this }),
      delegate: delegateTaskOperation({ datastore: this }),
      rename: renameTaskOperation({ datastore: this }),
      setStatus: setTaskStatusOperation({ datastore: this }),
      undelegate: undelegateTaskOperation({ datastore: this }),
      updateDescription: updateTaskDescriptionOperation({ datastore: this }),
    };
  }

  /**
   * Returns dependency operations bound to this realtime datastore.
   * Creating an edge runs the cycle and sibling validators in the engine.
   */
  public get taskDependencies() {
    return {
      create: createTaskDependencyOperation({ datastore: this }),
      delete: deleteTaskDependencyOperation({ datastore: this }),
      list: listTaskDependenciesOperation({ datastore: this }),
    };
  }

  /**
   * Returns metric query operations bound to this realtime datastore.
   * Aggregation is performed daemon-side; the UI receives only bucket summaries.
   */
  public get metrics() {
    return {
      listNames: listMetricNamesOperation({ datastore: this }),
      listVariants: listMetricVariantsOperation({ datastore: this }),
      queryAggregated: queryMetricsAggregatedOperation({ datastore: this }),
    };
  }

  /**
   * Returns task event operations bound to this realtime datastore.
   * Events are append-only natural-language status records emitted by the
   * daemon for both explicit setTaskStatus calls and cascading auto-changes.
   */
  public get taskEvents() {
    return {
      list: listTaskEventsOperation({ datastore: this }),
    };
  }

  /**
   * Returns dispatch settings operations bound to this realtime datastore.
   * Settings are per-scope (board or pool) and govern automatic dispatch
   * concurrency. Mutations broadcast `taskDispatchSettingsUpdated`.
   */
  public get taskDispatchSettings() {
    return {
      list: listTaskDispatchSettingsOperation({ datastore: this }),
      read: readTaskDispatchSettingsOperation({ datastore: this }),
      update: updateTaskDispatchSettingsOperation({ datastore: this }),
    };
  }

  public get taskTemplates() {
    return {
      create: createTaskTemplateOperation({ datastore: this }),
      delete: deleteTaskTemplateOperation({ datastore: this }),
      list: listTaskTemplatesOperation({ datastore: this }),
      update: updateTaskTemplateOperation({ datastore: this }),
      deliverables: {
        create: createTaskTemplateDeliverableOperation({ datastore: this }),
        delete: deleteTaskTemplateDeliverableOperation({ datastore: this }),
        list: listTaskTemplateDeliverablesOperation({ datastore: this }),
        update: updateTaskTemplateDeliverableOperation({ datastore: this }),
      },
    };
  }

  public get taskDeliverables() {
    return {
      list: listTaskDeliverablesOperation({ datastore: this }),
    };
  }

  public get taskDeliverableSubmissions() {
    return {
      list: listTaskDeliverableSubmissionsOperation({ datastore: this }),
    };
  }

  /**
   * Returns app-wide settings operations bound to this realtime datastore.
   * Settings are a singleton, so the operations are read + update only.
   */
  public get appSettings() {
    return {
      read: readAppSettingsOperation({ datastore: this }),
      update: updateAppSettingsOperation({ datastore: this }),
    };
  }

  /**
   * Returns the audio transcription operation bound to this realtime datastore.
   * The daemon resolves the inference profile and dispatches to the configured provider.
   */
  /**
   * Returns the text-to-speech operation bound to this realtime datastore.
   * The daemon resolves the inference profile and dispatches to the configured provider.
   */
  public get generateSpeech() {
    return generateSpeechOperation({ datastore: this });
  }

  public get transcribeAudio() {
    return transcribeAudioOperation({ datastore: this });
  }

  /**
   * Returns inference profile operations bound to this realtime datastore.
   * Profiles combine a saved integration with model-level settings.
   * Agent launch consumes profiles instead of raw integrations.
   */
  public get inferenceProfiles() {
    return {
      create: createInferenceProfileOperation({ datastore: this }),
      delete: deleteInferenceProfileOperation({ datastore: this }),
      list: listInferenceProfilesOperation({ datastore: this }),
      update: updateInferenceProfileOperation({ datastore: this }),
    };
  }

  /**
   * Returns agent runtime operations bound to this realtime datastore.
   * Lists hydrate lightweight registries while reads fetch full detail records.
   * Record commands return daemon acknowledgements and leave refresh decisions to callers.
   */
  public get agent() {
    return {
      calls: {
        list: listAgentCallsOperation({ datastore: this }),
        read: readAgentCallOperation({ datastore: this }),
        record: recordAgentCallOperation({ datastore: this }),
      },
      complete: completeAgentOperation({ datastore: this }),
      create: createAgentOperation({ datastore: this }),
      fail: failAgentOperation({ datastore: this }),
      launch: launchAgentOperation({ datastore: this }),
      list: listAgentsOperation({ datastore: this }),
      sendMessage: sendAgentMessageOperation({ datastore: this }),
      priceLineItems: {
        list: listAgentPriceLineItemsOperation({ datastore: this }),
        record: recordAgentPriceLineItemOperation({ datastore: this }),
      },
      read: readAgentOperation({ datastore: this }),
      rename: renameAgentOperation({ datastore: this }),
      resume: resumeAgentOperation({ datastore: this }),
      stop: stopAgentOperation({ datastore: this }),
      freshStart: freshStartAgentOperation({ datastore: this }),
      traces: {
        list: listAgentTracesOperation({ datastore: this }),
        record: recordAgentTraceOperation({ datastore: this }),
      },
    };
  }

  /**
   * Returns debug operations bound to this realtime datastore.
   * Debug log state is read through hooks while commands flow through the daemon.
   * The UI never reaches into the daemon filesystem directly.
   */
  public get debug() {
    return {
      logs: {
        list: listDebugLogsOperation({ datastore: this }),
        open: openDebugLogOperation({ datastore: this }),
        openDirectory: openDebugLogsDirectoryOperation({ datastore: this }),
        read: readDebugLogOperation({ datastore: this }),
      },
    };
  }

  public get threads() {
    return {
      list: listThreadsOperation({ datastore: this }),
      snapshots: {
        read: readThreadSnapshotOperation({ datastore: this }),
      },
    };
  }

  /**
   * Returns database maintenance commands owned by the local daemon.
   * These are explicit user actions, not durable realtime state.
   * The daemon performs filesystem access and schema migration work.
   */
  public get database() {
    return {
      describe: describeDatabaseOperation({ datastore: this }),
      migrate: migrateDatabaseOperation({ datastore: this }),
      open: openDatabaseOperation({ datastore: this }),
      runQuery: runDatabaseQueryOperation({ datastore: this }),
    };
  }

  /**
   * Registers the callback invoked when the websocket connection closes.
   * Only one handler is stored because the React provider owns the lifecycle.
   * Passing a new handler replaces the previous one.
   */
  public onClosed(handler: RealtimeClosedHandler): void {
    this.connectionClosedHandler = handler;
  }

  /**
   * Registers the callback invoked when a daemon operation fails.
   * UI shells use this for console logging and user-facing toasts.
   * Passing a new handler replaces the previous one.
   */
  public onError(handler: RealtimeOperationErrorHandler): void {
    this.operationErrorHandler = handler;
  }

  /**
   * Opens the daemon websocket and registers realtime state listeners.
   * Each listener is wired explicitly in the private listen method.
   * Connecting does not eagerly load state data.
   */
  public async connect(): Promise<void> {
    if (this.currentClient !== null) {
      return;
    }

    const client = new WsBridgeClient<ClientProtocol>({
      onClose: () => this.handleConnectionClosed(client),
      url: this.input.url,
    });
    this.currentClient = client;

    try {
      await client.connect(() => this.listen());
    } catch (error) {
      client.close();
      if (this.currentClient === client) {
        this.currentClient = null;
      }
      throw error;
    }
  }

  /**
   * Closes the daemon websocket and resets transient client state.
   * Durable application data is cleared because it belongs to this connection.
   * A later connect starts from a clean idle state.
   */
  public disconnect(): void {
    const client = this.currentClient;
    this.currentClient = null;
    client?.close();
    this.patch(createRealtimeState());
  }

  /**
   * Returns an operation callback bound to this datastore connection.
   * Protocol responses are acknowledgements; daemon events own durable updates.
   */
  public wrapEmit<TName extends RealtimeEmitName>(
    operation: TName,
  ): (payload: RealtimeEmitPayload<TName>) => Promise<void> {
    return async (payload) => {
      await this.emit(operation, payload);
    };
  }

  /**
   * Returns an operation callback with local lifecycle state transitions.
   * Use this only when a command needs optimistic row state.
   * Durable updates still come from daemon events.
   */
  public wrapEmitLifecycle<TName extends RealtimeEmitName>(
    operation: TName,
    options: RealtimeEmitOptions<TName>,
  ): (payload: RealtimeEmitPayload<TName>) => Promise<void> {
    return async (payload) => {
      options.before?.(payload);
      try {
        const response = await this.emit(operation, payload);
        options.after?.(payload, response);
      } catch (caughtError) {
        const error = caughtError instanceof Error ? caughtError : new Error('Realtime operation failed.');
        options.error?.(payload, error);
        throw error;
      }
    };
  }

  /**
   * Applies a partial state update to the owned Zustand store.
   * Feature modules use this to publish loadable state transitions.
   * The root state does not expose operation methods.
   */
  public patch(state: Partial<RealtimeState>): void {
    this.store.setState(state);
  }

  /**
   * Sends one protocol operation over the active websocket client.
   * The caller provides the operation name and payload from the daemon protocol.
   * The promise resolves with the daemon response or rejects if disconnected.
   */
  public async emit<TName extends RealtimeEmitName>(
    operation: TName,
    payload: RealtimeEmitPayload<TName>,
  ): Promise<RealtimeEmitResponse<TName>> {
    const client = this.currentClient;
    if (client === null) {
      const error = new Error('Realtime datastore is not connected.');
      this.operationErrorHandler?.({ error, operation });
      throw error;
    }

    try {
      return (await client.do(operation as never, payload as never)) as never;
    } catch (caughtError) {
      const error = caughtError instanceof Error ? caughtError : new Error('Realtime operation failed.');
      this.operationErrorHandler?.({ error, operation });
      throw error;
    }
  }

  private listen(): void {
    listenToAgentCalls({ datastore: this });
    listenToAgentLiveness({ datastore: this });
    listenToAgentPriceLineItems({ datastore: this });
    listenToAgentTraces({ datastore: this });
    listenToAgents({ datastore: this });
    listenToAppSettings({ datastore: this });
    listenToAutomations({ datastore: this });
    listenToDebugLogs({ datastore: this });
    listenToDocuments({ datastore: this });
    listenToInferenceProfiles({ datastore: this });
    listenToIntegrations({ datastore: this });
    listenToThirdPartyAgentInstalls({ datastore: this });
    listenToRepositories({ datastore: this });
    listenToWorktrees({ datastore: this });
    listenToWorkspaces({ datastore: this });
    listenToAgentRegistries({ datastore: this });
    listenToTasks({ datastore: this });
  }

  private handleConnectionClosed(client: RealtimeClient): void {
    if (this.currentClient !== client) {
      return;
    }

    this.currentClient = null;
    this.patch(createRealtimeState());
    this.connectionClosedHandler?.();
  }
}
