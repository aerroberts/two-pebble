import fs from 'node:fs';
import path from 'node:path';
import type { Client, Row, Value } from '@libsql/client';
import { createClient } from '@libsql/client';
import { logger } from '@two-pebble/logger';
import { metrics } from '@two-pebble/metrics';
import { drizzle } from 'drizzle-orm/libsql';
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
import { agentSetStatusOperation } from './operations/agent.set-status';
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
import { datastoreCloseOperation } from './operations/datastore.close';
import { datastoreMigrateOperation } from './operations/datastore.migrate';
import { datastoreStatusOperation } from './operations/datastore.status';
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
import { taskDependenciesCreateOperation } from './operations/task-dependencies.create';
import { taskDependenciesDeleteOperation } from './operations/task-dependencies.delete';
import { taskDependenciesListOperation } from './operations/task-dependencies.list';
import { taskEventsListOperation } from './operations/task-events.list';
import { taskEventsRecordOperation } from './operations/task-events.record';
import { taskPoolsCreateOperation } from './operations/task-pools.create';
import { taskPoolsDeleteOperation } from './operations/task-pools.delete';
import { taskPoolsListOperation } from './operations/task-pools.list';
import { taskPoolsSetParentOperation } from './operations/task-pools.set-parent';
import { tasksCreateOperation } from './operations/tasks.create';
import { tasksDeleteOperation } from './operations/tasks.delete';
import { tasksListOperation } from './operations/tasks.list';
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
    return {
      calls: {
        list: this.wrap(agentCallsListOperation, 'agent.calls.list'),
        read: this.wrap(agentCallsReadOperation, 'agent.calls.read'),
        record: this.wrap(agentCallsRecordOperation, 'agent.calls.record'),
      },
      complete: this.wrap(agentCompleteOperation, 'agent.complete'),
      conversationCells: {
        record: this.wrap(agentConversationCellsRecordOperation, 'agent.conversation-cells.record'),
        snapshot: this.wrap(agentConversationCellsSnapshotOperation, 'agent.conversation-cells.snapshot'),
      },
      create: this.wrap(agentCreateOperation, 'agent.create'),
      fail: this.wrap(agentFailOperation, 'agent.fail'),
      list: this.wrap(agentListOperation, 'agent.list'),
      setMetadata: this.wrap(agentSetMetadataOperation, 'agent.set-metadata'),
      setStatus: this.wrap(agentSetStatusOperation, 'agent.set-status'),
      priceLineItems: {
        list: this.wrap(agentPriceLineItemsListOperation, 'agent.price-line-items.list'),
        record: this.wrap(agentPriceLineItemsRecordOperation, 'agent.price-line-items.record'),
      },
      read: this.wrap(agentReadOperation, 'agent.read'),
      rename: this.wrap(agentRenameOperation, 'agent.rename'),
      traces: {
        list: this.wrap(agentTracesListOperation, 'agent.traces.list'),
        listByType: this.wrap(agentTracesListByTypeOperation, 'agent.traces.list-by-type'),
        record: this.wrap(agentTracesRecordOperation, 'agent.traces.record'),
      },
    };
  }

  /**
   * Returns third-party integration persistence handlers.
   * Integrations are global connection records, not agent-owned records.
   * Callers receive bound functions and do not manage database context.
   */
  public get integrations() {
    return {
      create: this.wrap(integrationsCreateOperation, 'integrations.create'),
      delete: this.wrap(integrationsDeleteOperation, 'integrations.delete'),
      list: this.wrap(integrationsListOperation, 'integrations.list'),
      read: this.wrap(integrationsReadOperation, 'integrations.read'),
      update: this.wrap(integrationsUpdateOperation, 'integrations.update'),
    };
  }

  /**
   * Returns third-party agent install persistence handlers.
   * Each row represents a framework agent binary available on this machine
   * (e.g. a `claude` executable). Many installs per framework are allowed.
   */
  public get thirdPartyAgentInstalls() {
    return {
      create: this.wrap(thirdPartyAgentInstallsCreateOperation, 'third-party-agent-installs.create'),
      delete: this.wrap(thirdPartyAgentInstallsDeleteOperation, 'third-party-agent-installs.delete'),
      list: this.wrap(thirdPartyAgentInstallsListOperation, 'third-party-agent-installs.list'),
      read: this.wrap(thirdPartyAgentInstallsReadOperation, 'third-party-agent-installs.read'),
      update: this.wrap(thirdPartyAgentInstallsUpdateOperation, 'third-party-agent-installs.update'),
    };
  }

  /**
   * Returns thread persistence handlers.
   * Threads are conversation cell groupings keyed by `threadId`.
   * The list handler aggregates cells per thread for developer browsing.
   */
  public get threads() {
    return {
      list: this.wrap(threadsListOperation, 'threads.list'),
    };
  }

  /**
   * Returns inference profile persistence handlers.
   * Profiles bind integrations to model-level runtime settings.
   * Pebble turns these records into concrete providers at launch time.
   */
  public get inferenceProfiles() {
    return {
      create: this.wrap(inferenceProfilesCreateOperation, 'inference-profiles.create'),
      delete: this.wrap(inferenceProfilesDeleteOperation, 'inference-profiles.delete'),
      list: this.wrap(inferenceProfilesListOperation, 'inference-profiles.list'),
      read: this.wrap(inferenceProfilesReadOperation, 'inference-profiles.read'),
      update: this.wrap(inferenceProfilesUpdateOperation, 'inference-profiles.update'),
    };
  }

  /**
   * Returns app-wide settings persistence handlers.
   * The settings row is a singleton; read returns defaults if no row exists,
   * and update upserts.
   */
  public get appSettings() {
    return {
      read: this.wrap(appSettingsReadOperation, 'app-settings.read'),
      update: this.wrap(appSettingsUpdateOperation, 'app-settings.update'),
    };
  }

  /**
   * Returns agent registry persistence handlers.
   * Each registry row binds a name + inference profile + system prompt
   * so the launch flow can build an agent from a single user-configured record.
   */
  public get agentRegistries() {
    return {
      create: this.wrap(agentRegistriesCreateOperation, 'agent-registries.create'),
      delete: this.wrap(agentRegistriesDeleteOperation, 'agent-registries.delete'),
      list: this.wrap(agentRegistriesListOperation, 'agent-registries.list'),
      read: this.wrap(agentRegistriesReadOperation, 'agent-registries.read'),
      update: this.wrap(agentRegistriesUpdateOperation, 'agent-registries.update'),
    };
  }

  /**
   * Returns metric persistence handlers.
   * `write` records a single observation and `queryAggregated` groups
   * observations into buckets server-side so callers never receive raw rows.
   */
  public get metrics() {
    return {
      write: this.wrap(metricsWriteOperation, 'metrics.write'),
      listNames: this.wrap(metricsListNamesOperation, 'metrics.list-names'),
      listVariants: this.wrap(metricsListVariantsOperation, 'metrics.list-variants'),
      queryAggregated: this.wrap(metricsQueryAggregatedOperation, 'metrics.query-aggregated'),
    };
  }

  /**
   * Returns repository persistence handlers.
   * Repositories are pointers to existing local git clones.
   * Worktrees derived from a repository are tracked separately.
   */
  public get repositories() {
    return {
      create: this.wrap(repositoriesCreateOperation, 'repositories.create'),
      delete: this.wrap(repositoriesDeleteOperation, 'repositories.delete'),
      list: this.wrap(repositoriesListOperation, 'repositories.list'),
      read: this.wrap(repositoriesReadOperation, 'repositories.read'),
      update: this.wrap(repositoriesUpdateOperation, 'repositories.update'),
    };
  }

  /**
   * Returns worktree persistence handlers.
   * Worktrees track lifecycle of git worktrees managed by the daemon.
   * Filesystem operations live in the daemon, not in the datastore.
   */
  public get worktrees() {
    return {
      create: this.wrap(worktreesCreateOperation, 'worktrees.create'),
      delete: this.wrap(worktreesDeleteOperation, 'worktrees.delete'),
      list: this.wrap(worktreesListOperation, 'worktrees.list'),
      read: this.wrap(worktreesReadOperation, 'worktrees.read'),
      update: this.wrap(worktreesUpdateOperation, 'worktrees.update'),
    };
  }

  /**
   * Returns workspace persistence handlers.
   * Workspaces describe an on-disk path an agent can operate within.
   * A workspace optionally references a worktree.
   */
  public get workspaces() {
    return {
      create: this.wrap(workspacesCreateOperation, 'workspaces.create'),
      list: this.wrap(workspacesListOperation, 'workspaces.list'),
      read: this.wrap(workspacesReadOperation, 'workspaces.read'),
    };
  }

  /**
   * Returns task-board persistence handlers.
   * Each board owns pools, tasks, and dependencies that the daemon's
   * TaskBoardService loads into the in-memory engine.
   */
  public get taskBoards() {
    return {
      create: this.wrap(taskBoardsCreateOperation, 'task-boards.create'),
      delete: this.wrap(taskBoardsDeleteOperation, 'task-boards.delete'),
      list: this.wrap(taskBoardsListOperation, 'task-boards.list'),
      read: this.wrap(taskBoardsReadOperation, 'task-boards.read'),
      update: this.wrap(taskBoardsUpdateOperation, 'task-boards.update'),
      pools: {
        create: this.wrap(taskPoolsCreateOperation, 'task-pools.create'),
        delete: this.wrap(taskPoolsDeleteOperation, 'task-pools.delete'),
        list: this.wrap(taskPoolsListOperation, 'task-pools.list'),
        setParent: this.wrap(taskPoolsSetParentOperation, 'task-pools.set-parent'),
      },
      tasks: {
        create: this.wrap(tasksCreateOperation, 'tasks.create'),
        delete: this.wrap(tasksDeleteOperation, 'tasks.delete'),
        list: this.wrap(tasksListOperation, 'tasks.list'),
        rename: this.wrap(tasksRenameOperation, 'tasks.rename'),
        setOwner: this.wrap(tasksSetOwnerOperation, 'tasks.set-owner'),
        setPool: this.wrap(tasksSetPoolOperation, 'tasks.set-pool'),
        update: this.wrap(tasksUpdateOperation, 'tasks.update'),
        updateDescription: this.wrap(tasksUpdateDescriptionOperation, 'tasks.update-description'),
      },
      dependencies: {
        create: this.wrap(taskDependenciesCreateOperation, 'task-dependencies.create'),
        delete: this.wrap(taskDependenciesDeleteOperation, 'task-dependencies.delete'),
        list: this.wrap(taskDependenciesListOperation, 'task-dependencies.list'),
      },
      events: {
        list: this.wrap(taskEventsListOperation, 'task-events.list'),
        record: this.wrap(taskEventsRecordOperation, 'task-events.record'),
      },
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

  private wrapOperation(operation: string, handler: DatastoreOperationHandler): DatastoreOperationHandler {
    const logged: DatastoreOperationHandler = async (...args) => {
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
    // Metrics on metric operations would feed back into themselves and produce
    // unbounded recursion through the registered onMetric handler.
    if (operation.startsWith('metrics.')) return logged;
    return metrics.wrap('datastore.operation', logged, { operation }) as DatastoreOperationHandler;
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
    if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string')
      return value;
    if (typeof value === 'bigint') return value.toString();
    if (value instanceof ArrayBuffer) return `[blob: ${value.byteLength} bytes]`;
    return String(value);
  }

  private quoteIdentifier(id: string) {
    return `"${id.replaceAll('"', '""')}"`;
  }
}
