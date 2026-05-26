import fs from 'node:fs';
import path from 'node:path';
import type { Client, Row, Value } from '@libsql/client';
import { createClient } from '@libsql/client';
import { logger } from '@two-pebble/logger';
import { drizzle } from 'drizzle-orm/libsql';
import type { DatastoreOperationBinder } from './datastore-operation-binder';
import { agentCallsListOperation } from './operations/agent.calls.list';
import { agentCallsReadOperation } from './operations/agent.calls.read';
import { agentCallsRecordOperation } from './operations/agent.calls.record';
import { agentCompleteOperation } from './operations/agent.complete';
import { agentConversationCellsRecordOperation } from './operations/agent.conversation.cells.record';
import { agentConversationCellsSnapshotOperation } from './operations/agent.conversation.cells.snapshot';
import { agentCreateOperation } from './operations/agent.create';
import { agentFailOperation } from './operations/agent.fail';
import { agentListOperation } from './operations/agent.list';
import { agentPriceLineItemsListOperation } from './operations/agent.price-line-items.list';
import { agentPriceLineItemsRecordOperation } from './operations/agent.price-line-items.record';
import { agentReadOperation } from './operations/agent.read';
import { agentRenameOperation } from './operations/agent.rename';
import { agentSetMetadataOperation } from './operations/agent.set-metadata';
import { agentSetParentResponseSignalIdOperation } from './operations/agent.set-parent-response-signal-id';
import { agentSetStatusOperation } from './operations/agent.set-status';
import { agentSignalsListForAgentOperation } from './operations/agent.signals.list-for-agent';
import { agentSignalsListOpenForAgentOperation } from './operations/agent.signals.list-open-for-agent';
import { agentSignalsListReceivedForAgentOperation } from './operations/agent.signals.list-received-for-agent';
import { agentSignalsMarkResolvedOperation } from './operations/agent.signals.mark-resolved';
import { agentSignalsRegisterOperation } from './operations/agent.signals.register';
import { agentSignalsResolveOperation } from './operations/agent.signals.resolve';
import { agentSignalsSendPushOperation } from './operations/agent.signals.send-push';
import { agentTracesListOperation } from './operations/agent.traces.list';
import { agentTracesListByTypeOperation } from './operations/agent.traces.list-by-type';
import { agentTracesRecordOperation } from './operations/agent.traces.record';
import { agentRegistriesCreateOperation } from './operations/agent-registries.create';
import { agentRegistriesDeleteOperation } from './operations/agent-registries.delete';
import { agentRegistriesListOperation } from './operations/agent-registries.list';
import { agentRegistriesReadOperation } from './operations/agent-registries.read';
import { agentRegistriesUpdateOperation } from './operations/agent-registries.update';
import { appSettingsReadOperation } from './operations/app-settings.read';
import { appSettingsUpdateOperation } from './operations/app-settings.update';
import { automationsCreateOperation } from './operations/automations.create';
import { automationsDeleteOperation } from './operations/automations.delete';
import { automationsListOperation } from './operations/automations.list';
import { automationsReadOperation } from './operations/automations.read';
import { automationsRecordRunOperation } from './operations/automations.record-run';
import { automationsUpdateOperation } from './operations/automations.update';
import { datastoreCloseOperation } from './operations/datastore.close';
import { datastoreMigrateOperation } from './operations/datastore.migrate';
import { datastoreStatusOperation } from './operations/datastore.status';
import { documentsCreateOperation } from './operations/documents.create';
import { documentsDeleteOperation } from './operations/documents.delete';
import { documentsListOperation } from './operations/documents.list';
import { documentsReadOperation } from './operations/documents.read';
import { documentsUpdateOperation } from './operations/documents.update';
import { heartbeatsInsertOperation } from './operations/heartbeats.insert';
import { heartbeatsListOperation } from './operations/heartbeats.list';
import { heartbeatsPruneOperation } from './operations/heartbeats.prune';
import { inferenceProfilesCreateOperation } from './operations/inference-profiles.create';
import { inferenceProfilesDeleteOperation } from './operations/inference-profiles.delete';
import { inferenceProfilesListOperation } from './operations/inference-profiles.list';
import { inferenceProfilesReadOperation } from './operations/inference-profiles.read';
import { inferenceProfilesUpdateOperation } from './operations/inference-profiles.update';
import { integrationsCreateOperation } from './operations/integrations.create';
import { integrationsDeleteOperation } from './operations/integrations.delete';
import { integrationsListOperation } from './operations/integrations.list';
import { integrationsReadOperation } from './operations/integrations.read';
import { integrationsUpdateOperation } from './operations/integrations.update';
import { metricsListNamesOperation } from './operations/metrics.list-names';
import { metricsListVariantsOperation } from './operations/metrics.list-variants';
import { metricsQueryAggregatedOperation } from './operations/metrics.query-aggregated';
import { metricsWriteOperation } from './operations/metrics.write';
import { repositoriesCreateOperation } from './operations/repositories.create';
import { repositoriesDeleteOperation } from './operations/repositories.delete';
import { repositoriesListOperation } from './operations/repositories.list';
import { repositoriesReadOperation } from './operations/repositories.read';
import { repositoriesUpdateOperation } from './operations/repositories.update';
import { taskBoardsCreateOperation } from './operations/task-boards.create';
import { taskBoardsDeleteOperation } from './operations/task-boards.delete';
import { taskBoardsListOperation } from './operations/task-boards.list';
import { taskBoardsReadOperation } from './operations/task-boards.read';
import { taskBoardsUpdateOperation } from './operations/task-boards.update';
import { taskDeliverableSubmissionsListOperation } from './operations/task-deliverable-submissions.list';
import { taskDeliverableSubmissionsReadOperation } from './operations/task-deliverable-submissions.read';
import { taskDeliverableSubmissionsUpsertOperation } from './operations/task-deliverable-submissions.upsert';
import { taskDeliverablesCreateOperation } from './operations/task-deliverables.create';
import { taskDeliverablesDeleteOperation } from './operations/task-deliverables.delete';
import { taskDeliverablesListOperation } from './operations/task-deliverables.list';
import { taskDeliverablesReadOperation } from './operations/task-deliverables.read';
import { taskDependenciesCreateOperation } from './operations/task-dependencies.create';
import { taskDependenciesDeleteOperation } from './operations/task-dependencies.delete';
import { taskDependenciesListOperation } from './operations/task-dependencies.list';
import { taskEventsListOperation } from './operations/task-events.list';
import { taskEventsRecordOperation } from './operations/task-events.record';
import { taskPoolsCreateOperation } from './operations/task-pools.create';
import { taskPoolsDeleteOperation } from './operations/task-pools.delete';
import { taskPoolsListOperation } from './operations/task-pools.list';
import { taskPoolsSetParentOperation } from './operations/task-pools.set-parent';
import { taskTemplateDeliverablesCreateOperation } from './operations/task-template-deliverables.create';
import { taskTemplateDeliverablesDeleteOperation } from './operations/task-template-deliverables.delete';
import { taskTemplateDeliverablesListOperation } from './operations/task-template-deliverables.list';
import { taskTemplateDeliverablesUpdateOperation } from './operations/task-template-deliverables.update';
import { taskTemplatesCreateOperation } from './operations/task-templates.create';
import { taskTemplatesDeleteOperation } from './operations/task-templates.delete';
import { taskTemplatesListOperation } from './operations/task-templates.list';
import { taskTemplatesReadOperation } from './operations/task-templates.read';
import { taskTemplatesUpdateOperation } from './operations/task-templates.update';
import { tasksCreateOperation } from './operations/tasks.create';
import { tasksDeleteOperation } from './operations/tasks.delete';
import { tasksListOperation } from './operations/tasks.list';
import { tasksReadOperation } from './operations/tasks.read';
import { tasksRenameOperation } from './operations/tasks.rename';
import { tasksSetOwnerOperation } from './operations/tasks.set-owner';
import { tasksSetPoolOperation } from './operations/tasks.set-pool';
import { tasksUpdateOperation } from './operations/tasks.update';
import { tasksUpdateDescriptionOperation } from './operations/tasks.update-description';
import { thirdPartyAgentInstallsCreateOperation } from './operations/third-party-agent-installs.create';
import { thirdPartyAgentInstallsDeleteOperation } from './operations/third-party-agent-installs.delete';
import { thirdPartyAgentInstallsListOperation } from './operations/third-party-agent-installs.list';
import { thirdPartyAgentInstallsReadOperation } from './operations/third-party-agent-installs.read';
import { thirdPartyAgentInstallsUpdateOperation } from './operations/third-party-agent-installs.update';
import { threadsListOperation } from './operations/threads.list';
import { trackedPrsListOpenOperation, trackedPrsListOperation } from './operations/tracked-prs.list';
import { trackedPrsUpdateOperation } from './operations/tracked-prs.update';
import { trackedPrsUpsertOperation } from './operations/tracked-prs.upsert';
import { workspacesCreateOperation } from './operations/workspaces.create';
import { workspacesListOperation } from './operations/workspaces.list';
import { workspacesReadOperation } from './operations/workspaces.read';
import { worktreesCreateOperation } from './operations/worktrees.create';
import { worktreesDeleteOperation } from './operations/worktrees.delete';
import { worktreesListOperation } from './operations/worktrees.list';
import { worktreesReadOperation } from './operations/worktrees.read';
import { worktreesUpdateOperation } from './operations/worktrees.update';
import * as schema from './schema';
import type {
  DatabaseColumnNames,
  DatabaseDescription,
  DatabaseQueryResult,
  DatabaseQueryRow,
  DatabaseQueryValue,
  DatabaseTableDescription,
  DatabaseTableSizeMap,
  DatastoreInput,
  DatastoreOperationHandler,
  DrizzleDatabase,
  Wrappable,
} from './types';

/**
 * Owns the sqlite connection and exposes the persistence operations grouped
 * by the runtime concept that uses them.
 */
export class Datastore {
  private readonly databaseFilePath: string;
  private readonly drizzleDatabase: DrizzleDatabase;
  private readonly libsqlClient: Client;

  public constructor(input: DatastoreInput) {
    fs.mkdirSync(path.dirname(input.databaseFilePath), { recursive: true });

    this.databaseFilePath = input.databaseFilePath;
    this.libsqlClient = createClient({ url: `file:${input.databaseFilePath}` });
    this.drizzleDatabase = drizzle(this.libsqlClient, { schema });
  }

  /**
   * Returns agent persistence handlers.
   * Handlers are grouped by agent records, calls, and traces.
   * Callers receive bound functions and do not manage database context.
   */
  public get agent() {
    const bind = this.operationBinder();
    return {
      calls: {
        list: bind(agentCallsListOperation, 'agent.calls.list'),
        read: bind(agentCallsReadOperation, 'agent.calls.read'),
        record: bind(agentCallsRecordOperation, 'agent.calls.record'),
      },
      complete: bind(agentCompleteOperation, 'agent.complete'),
      conversationCells: {
        record: bind(agentConversationCellsRecordOperation, 'agent.conversation-cells.record'),
        snapshot: bind(agentConversationCellsSnapshotOperation, 'agent.conversation-cells.snapshot'),
      },
      create: bind(agentCreateOperation, 'agent.create'),
      fail: bind(agentFailOperation, 'agent.fail'),
      list: bind(agentListOperation, 'agent.list'),
      setMetadata: bind(agentSetMetadataOperation, 'agent.set-metadata'),
      setParentResponseSignalId: bind(agentSetParentResponseSignalIdOperation, 'agent.set-parent-response-signal-id'),
      setStatus: bind(agentSetStatusOperation, 'agent.set-status'),
      signals: {
        listForAgent: bind(agentSignalsListForAgentOperation, 'agent.signals.list-for-agent'),
        listOpenForAgent: bind(agentSignalsListOpenForAgentOperation, 'agent.signals.list-open-for-agent'),
        listReceivedForAgent: bind(agentSignalsListReceivedForAgentOperation, 'agent.signals.list-received-for-agent'),
        markResolved: bind(agentSignalsMarkResolvedOperation, 'agent.signals.mark-resolved'),
        register: bind(agentSignalsRegisterOperation, 'agent.signals.register'),
        resolve: bind(agentSignalsResolveOperation, 'agent.signals.resolve'),
        sendPush: bind(agentSignalsSendPushOperation, 'agent.signals.send-push'),
      },
      priceLineItems: {
        list: bind(agentPriceLineItemsListOperation, 'agent.price-line-items.list'),
        record: bind(agentPriceLineItemsRecordOperation, 'agent.price-line-items.record'),
      },
      read: bind(agentReadOperation, 'agent.read'),
      rename: bind(agentRenameOperation, 'agent.rename'),
      traces: {
        list: bind(agentTracesListOperation, 'agent.traces.list'),
        listByType: bind(agentTracesListByTypeOperation, 'agent.traces.list-by-type'),
        record: bind(agentTracesRecordOperation, 'agent.traces.record'),
      },
    };
  }

  /**
   * Returns third-party integration persistence handlers.
   * Integrations are global connection records, not agent-owned records.
   * Callers receive bound functions and do not manage database context.
   */
  public get integrations() {
    const bind = this.operationBinder();
    return {
      create: bind(integrationsCreateOperation, 'integrations.create'),
      delete: bind(integrationsDeleteOperation, 'integrations.delete'),
      list: bind(integrationsListOperation, 'integrations.list'),
      read: bind(integrationsReadOperation, 'integrations.read'),
      update: bind(integrationsUpdateOperation, 'integrations.update'),
    };
  }

  /**
   * Returns third-party agent install persistence handlers.
   * Each row represents a framework agent binary available on this machine
   * (e.g. a `claude` executable). Many installs per framework are allowed.
   */
  public get thirdPartyAgentInstalls() {
    const bind = this.operationBinder();
    return {
      create: bind(thirdPartyAgentInstallsCreateOperation, 'third-party-agent-installs.create'),
      delete: bind(thirdPartyAgentInstallsDeleteOperation, 'third-party-agent-installs.delete'),
      list: bind(thirdPartyAgentInstallsListOperation, 'third-party-agent-installs.list'),
      read: bind(thirdPartyAgentInstallsReadOperation, 'third-party-agent-installs.read'),
      update: bind(thirdPartyAgentInstallsUpdateOperation, 'third-party-agent-installs.update'),
    };
  }

  /**
   * Returns thread persistence handlers.
   * Threads are conversation cell groupings keyed by `threadId`.
   * The list handler aggregates cells per thread for developer browsing.
   */
  public get threads() {
    const bind = this.operationBinder();
    return {
      list: bind(threadsListOperation, 'threads.list'),
    };
  }

  /**
   * Returns inference profile persistence handlers.
   * Profiles bind integrations to model-level runtime settings.
   * Pebble turns these records into concrete providers at launch time.
   */
  public get inferenceProfiles() {
    const bind = this.operationBinder();
    return {
      create: bind(inferenceProfilesCreateOperation, 'inference-profiles.create'),
      delete: bind(inferenceProfilesDeleteOperation, 'inference-profiles.delete'),
      list: bind(inferenceProfilesListOperation, 'inference-profiles.list'),
      read: bind(inferenceProfilesReadOperation, 'inference-profiles.read'),
      update: bind(inferenceProfilesUpdateOperation, 'inference-profiles.update'),
    };
  }

  /**
   * Returns app-wide settings persistence handlers.
   * The settings row is a singleton; read returns defaults if no row exists,
   * and update upserts.
   */
  public get appSettings() {
    const bind = this.operationBinder();
    return {
      read: bind(appSettingsReadOperation, 'app-settings.read'),
      update: bind(appSettingsUpdateOperation, 'app-settings.update'),
    };
  }

  public get automations() {
    const bind = this.operationBinder();
    return {
      create: bind(automationsCreateOperation, 'automations.create'),
      delete: bind(automationsDeleteOperation, 'automations.delete'),
      list: bind(automationsListOperation, 'automations.list'),
      read: bind(automationsReadOperation, 'automations.read'),
      recordRun: bind(automationsRecordRunOperation, 'automations.record-run'),
      update: bind(automationsUpdateOperation, 'automations.update'),
    };
  }

  public get heartbeats() {
    const bind = this.operationBinder();
    return {
      insert: bind(heartbeatsInsertOperation, 'heartbeats.insert'),
      list: bind(heartbeatsListOperation, 'heartbeats.list'),
      prune: bind(heartbeatsPruneOperation, 'heartbeats.prune'),
    };
  }

  /**
   * Returns agent registry persistence handlers.
   * Each registry row binds a name + inference profile + system prompt
   * so the launch flow can build an agent from a single user-configured record.
   */
  public get agentRegistries() {
    const bind = this.operationBinder();
    return {
      create: bind(agentRegistriesCreateOperation, 'agent-registries.create'),
      delete: bind(agentRegistriesDeleteOperation, 'agent-registries.delete'),
      list: bind(agentRegistriesListOperation, 'agent-registries.list'),
      read: bind(agentRegistriesReadOperation, 'agent-registries.read'),
      update: bind(agentRegistriesUpdateOperation, 'agent-registries.update'),
    };
  }

  /**
   * Returns metric persistence handlers.
   * `write` records a single observation and `queryAggregated` groups
   * observations into buckets server-side so callers never receive raw rows.
   */
  public get metrics() {
    const bind = this.operationBinder();
    return {
      write: bind(metricsWriteOperation, 'metrics.write'),
      listNames: bind(metricsListNamesOperation, 'metrics.list-names'),
      listVariants: bind(metricsListVariantsOperation, 'metrics.list-variants'),
      queryAggregated: bind(metricsQueryAggregatedOperation, 'metrics.query-aggregated'),
    };
  }

  /**
   * Returns repository persistence handlers.
   * Repositories are pointers to existing local git clones.
   * Worktrees derived from a repository are tracked separately.
   */
  public get repositories() {
    const bind = this.operationBinder();
    return {
      create: bind(repositoriesCreateOperation, 'repositories.create'),
      delete: bind(repositoriesDeleteOperation, 'repositories.delete'),
      list: bind(repositoriesListOperation, 'repositories.list'),
      read: bind(repositoriesReadOperation, 'repositories.read'),
      update: bind(repositoriesUpdateOperation, 'repositories.update'),
    };
  }

  /**
   * Returns document persistence handlers.
   * Document content is serialized TipTap JSON; callers parse at the edge.
   */
  public get documents() {
    const bind = this.operationBinder();
    return {
      create: bind(documentsCreateOperation, 'documents.create'),
      delete: bind(documentsDeleteOperation, 'documents.delete'),
      list: bind(documentsListOperation, 'documents.list'),
      read: bind(documentsReadOperation, 'documents.read'),
      update: bind(documentsUpdateOperation, 'documents.update'),
    };
  }

  /**
   * Returns worktree persistence handlers.
   * Worktrees track lifecycle of git worktrees managed by the daemon.
   * Filesystem operations live in the daemon, not in the datastore.
   */
  public get worktrees() {
    const bind = this.operationBinder();
    return {
      create: bind(worktreesCreateOperation, 'worktrees.create'),
      delete: bind(worktreesDeleteOperation, 'worktrees.delete'),
      list: bind(worktreesListOperation, 'worktrees.list'),
      read: bind(worktreesReadOperation, 'worktrees.read'),
      update: bind(worktreesUpdateOperation, 'worktrees.update'),
    };
  }

  /**
   * Returns workspace persistence handlers.
   * Workspaces describe an on-disk path an agent can operate within.
   * A workspace optionally references a worktree.
   */
  public get workspaces() {
    const bind = this.operationBinder();
    return {
      create: bind(workspacesCreateOperation, 'workspaces.create'),
      list: bind(workspacesListOperation, 'workspaces.list'),
      read: bind(workspacesReadOperation, 'workspaces.read'),
    };
  }

  /**
   * Returns task-board persistence handlers.
   * Each board owns pools, tasks, and dependencies that the daemon's
   * TaskBoardService loads into the in-memory engine.
   */
  public get taskBoards() {
    const bind = this.operationBinder();
    return {
      create: bind(taskBoardsCreateOperation, 'task-boards.create'),
      delete: bind(taskBoardsDeleteOperation, 'task-boards.delete'),
      list: bind(taskBoardsListOperation, 'task-boards.list'),
      read: bind(taskBoardsReadOperation, 'task-boards.read'),
      update: bind(taskBoardsUpdateOperation, 'task-boards.update'),
      pools: {
        create: bind(taskPoolsCreateOperation, 'task-pools.create'),
        delete: bind(taskPoolsDeleteOperation, 'task-pools.delete'),
        list: bind(taskPoolsListOperation, 'task-pools.list'),
        setParent: bind(taskPoolsSetParentOperation, 'task-pools.set-parent'),
      },
      templates: {
        create: bind(taskTemplatesCreateOperation, 'task-templates.create'),
        delete: bind(taskTemplatesDeleteOperation, 'task-templates.delete'),
        list: bind(taskTemplatesListOperation, 'task-templates.list'),
        read: bind(taskTemplatesReadOperation, 'task-templates.read'),
        update: bind(taskTemplatesUpdateOperation, 'task-templates.update'),
        deliverables: {
          create: bind(taskTemplateDeliverablesCreateOperation, 'task-template-deliverables.create'),
          delete: bind(taskTemplateDeliverablesDeleteOperation, 'task-template-deliverables.delete'),
          list: bind(taskTemplateDeliverablesListOperation, 'task-template-deliverables.list'),
          update: bind(taskTemplateDeliverablesUpdateOperation, 'task-template-deliverables.update'),
        },
      },
      tasks: {
        create: bind(tasksCreateOperation, 'tasks.create'),
        delete: bind(tasksDeleteOperation, 'tasks.delete'),
        list: bind(tasksListOperation, 'tasks.list'),
        read: bind(tasksReadOperation, 'tasks.read'),
        rename: bind(tasksRenameOperation, 'tasks.rename'),
        setOwner: bind(tasksSetOwnerOperation, 'tasks.set-owner'),
        setPool: bind(tasksSetPoolOperation, 'tasks.set-pool'),
        update: bind(tasksUpdateOperation, 'tasks.update'),
        updateDescription: bind(tasksUpdateDescriptionOperation, 'tasks.update-description'),
      },
      deliverables: {
        create: bind(taskDeliverablesCreateOperation, 'task-deliverables.create'),
        delete: bind(taskDeliverablesDeleteOperation, 'task-deliverables.delete'),
        list: bind(taskDeliverablesListOperation, 'task-deliverables.list'),
        read: bind(taskDeliverablesReadOperation, 'task-deliverables.read'),
      },
      deliverableSubmissions: {
        list: bind(taskDeliverableSubmissionsListOperation, 'task-deliverable-submissions.list'),
        read: bind(taskDeliverableSubmissionsReadOperation, 'task-deliverable-submissions.read'),
        upsert: bind(taskDeliverableSubmissionsUpsertOperation, 'task-deliverable-submissions.upsert'),
      },
      dependencies: {
        create: bind(taskDependenciesCreateOperation, 'task-dependencies.create'),
        delete: bind(taskDependenciesDeleteOperation, 'task-dependencies.delete'),
        list: bind(taskDependenciesListOperation, 'task-dependencies.list'),
      },
      events: {
        list: bind(taskEventsListOperation, 'task-events.list'),
        record: bind(taskEventsRecordOperation, 'task-events.record'),
      },
    };
  }

  public get trackedPrs() {
    const bind = this.operationBinder();
    return {
      list: bind(trackedPrsListOperation, 'tracked-prs.list'),
      listOpen: bind(trackedPrsListOpenOperation, 'tracked-prs.list-open'),
      update: bind(trackedPrsUpdateOperation, 'tracked-prs.update'),
      upsert: bind(trackedPrsUpsertOperation, 'tracked-prs.upsert'),
    };
  }

  /**
   * Closes the sqlite database connection.
   * Call this once the process is finished with the datastore.
   * No value is returned after the connection has been closed.
   */
  public async close(): Promise<void> {
    return this.wrap(datastoreCloseOperation, 'datastore.close')({});
  }

  /**
   * Applies Drizzle migrations to this datastore connection.
   * Migrations are read from the package migrations directory.
   * The promise resolves after the database schema is current.
   */
  public async migrate(): Promise<void> {
    return this.wrap(datastoreMigrateOperation, 'datastore.migrate')({});
  }

  /**
   * Reads table-level diagnostics for the local sqlite file.
   * Table sizes use SQLite dbstat page totals when available.
   * The result is metadata only and does not include row contents.
   */
  public async describeDatabase(): Promise<DatabaseDescription> {
    const tables = await this.readTableDescriptions();
    return { path: this.databaseFilePath, tables };
  }

  /**
   * Executes an explicit SQL query against the local database.
   * Returned cell values are normalized to JSON-safe primitives.
   * This powers developer tooling and should stay user initiated.
   */
  public async runQuery(query: string): Promise<DatabaseQueryResult> {
    const result = await this.libsqlClient.execute(query);
    const columns = result.columns.map((column) => String(column));
    return {
      columns,
      rows: result.rows.map((row) => this.normalizeQueryRow(columns, row)),
      rowsAffected: result.rowsAffected,
    };
  }

  /**
   * Reads aggregate datastore counts.
   * The status includes agent, call, and integration totals.
   * The database file path is included for diagnostics and UI display.
   */
  public async status() {
    return this.wrap(datastoreStatusOperation, 'datastore.status')({});
  }

  private wrap<T>(handler: Wrappable<T>, operation: string): T {
    const bound = handler({
      schema,
      datastore: this,
      database: this.drizzleDatabase,
      databaseFilePath: this.databaseFilePath,
      libsqlClient: this.libsqlClient,
    });

    if (typeof bound !== 'function') {
      return bound;
    }

    return this.wrapOperation(operation, bound as DatastoreOperationHandler) as T;
  }

  private operationBinder(): DatastoreOperationBinder {
    return (handler, operation) => this.wrap(handler, operation);
  }

  private wrapOperation(operation: string, handler: DatastoreOperationHandler): DatastoreOperationHandler {
    // Per-operation datastore metrics produced excessive cardinality and noise
    // (every get/put/delete/list fired duration/success/failure counters).
    // Higher-level observability lives at the daemon operation surface and on
    // explicit business metrics inside individual operations, so the generic
    // datastore wrapper now only logs failures and forwards the call.
    return async (...args) => {
      try {
        return await handler(...args);
      } catch (error) {
        logger.warn('datastore operation failed', {
          error: error instanceof Error ? error : String(error),
          operation,
        });
        throw error;
      }
    };
  }

  private async readTableDescriptions(): Promise<DatabaseTableDescription[]> {
    const tableRows = await this.libsqlClient.execute(
      "SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    );
    const names = tableRows.rows.map((row) => String(row.name));
    const sizes = await this.readTableSizes();
    const descriptions = await Promise.all(
      names.map(async (name) => ({
        name,
        rowCount: await this.readTableRowCount(name),
        sizeBytes: sizes.get(name) ?? 0,
      })),
    );
    return descriptions;
  }

  private async readTableRowCount(tableName: string): Promise<number> {
    const result = await this.libsqlClient.execute(
      `SELECT COUNT(*) AS rowCount FROM ${this.quoteIdentifier(tableName)}`,
    );
    return Number(result.rows[0]?.rowCount ?? 0);
  }

  private async readTableSizes(): Promise<DatabaseTableSizeMap> {
    try {
      const result = await this.libsqlClient.execute('SELECT name, SUM(pgsize) AS sizeBytes FROM dbstat GROUP BY name');
      return new Map(result.rows.map((row) => [String(row.name), Number(row.sizeBytes ?? 0)]));
    } catch {
      return new Map();
    }
  }

  private normalizeQueryRow(columns: DatabaseColumnNames, row: Row): DatabaseQueryRow {
    return Object.fromEntries(
      columns.map((column, index) => [column, this.normalizeQueryValue(row[column] ?? row[index])]),
    );
  }

  private normalizeQueryValue(value: Value): DatabaseQueryValue {
    if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
      return value;
    }
    if (typeof value === 'bigint') {
      return value.toString();
    }
    if (value instanceof ArrayBuffer) {
      return `[blob: ${value.byteLength} bytes]`;
    }
    return String(value);
  }

  private quoteIdentifier(id: string) {
    return `"${id.replaceAll('"', '""')}"`;
  }
}
