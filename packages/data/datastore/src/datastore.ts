import fs from 'node:fs';
import path from 'node:path';
import type { Client, Row, Value } from '@libsql/client';
import { createClient } from '@libsql/client';
import { logger } from '@two-pebble/logger';
import { metrics } from '@two-pebble/metrics';
import { drizzle } from 'drizzle-orm/libsql';
import type { DatastoreOperationBinder } from './datastore-operation-binder';
import { bindAgentOperationGroup } from './operation-groups/agent-operation-group';
import {
  bindAgentRegistryOperationGroup,
  bindAppSettingsOperationGroup,
  bindInferenceProfileOperationGroup,
  bindIntegrationOperationGroup,
  bindThirdPartyAgentInstallOperationGroup,
} from './operation-groups/configuration-operation-group';
import {
  bindMetricOperationGroup,
  bindRepositoryOperationGroup,
  bindThreadOperationGroup,
  bindWorkspaceOperationGroup,
  bindWorktreeOperationGroup,
} from './operation-groups/storage-operation-group';
import { bindTaskBoardOperationGroup } from './operation-groups/task-board-operation-group';
import { datastoreCloseOperation } from './operations/datastore.close';
import { datastoreMigrateOperation } from './operations/datastore.migrate';
import { datastoreStatusOperation } from './operations/datastore.status';
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
    return bindAgentOperationGroup(this.operationBinder());
  }

  /**
   * Returns third-party integration persistence handlers.
   * Integrations are global connection records, not agent-owned records.
   * Callers receive bound functions and do not manage database context.
   */
  public get integrations() {
    return bindIntegrationOperationGroup(this.operationBinder());
  }

  /**
   * Returns third-party agent install persistence handlers.
   * Each row represents a framework agent binary available on this machine
   * (e.g. a `claude` executable). Many installs per framework are allowed.
   */
  public get thirdPartyAgentInstalls() {
    return bindThirdPartyAgentInstallOperationGroup(this.operationBinder());
  }

  /**
   * Returns thread persistence handlers.
   * Threads are conversation cell groupings keyed by `threadId`.
   * The list handler aggregates cells per thread for developer browsing.
   */
  public get threads() {
    return bindThreadOperationGroup(this.operationBinder());
  }

  /**
   * Returns inference profile persistence handlers.
   * Profiles bind integrations to model-level runtime settings.
   * Pebble turns these records into concrete providers at launch time.
   */
  public get inferenceProfiles() {
    return bindInferenceProfileOperationGroup(this.operationBinder());
  }

  /**
   * Returns app-wide settings persistence handlers.
   * The settings row is a singleton; read returns defaults if no row exists,
   * and update upserts.
   */
  public get appSettings() {
    return bindAppSettingsOperationGroup(this.operationBinder());
  }

  /**
   * Returns agent registry persistence handlers.
   * Each registry row binds a name + inference profile + system prompt
   * so the launch flow can build an agent from a single user-configured record.
   */
  public get agentRegistries() {
    return bindAgentRegistryOperationGroup(this.operationBinder());
  }

  /**
   * Returns metric persistence handlers.
   * `write` records a single observation and `queryAggregated` groups
   * observations into buckets server-side so callers never receive raw rows.
   */
  public get metrics() {
    return bindMetricOperationGroup(this.operationBinder());
  }

  /**
   * Returns repository persistence handlers.
   * Repositories are pointers to existing local git clones.
   * Worktrees derived from a repository are tracked separately.
   */
  public get repositories() {
    return bindRepositoryOperationGroup(this.operationBinder());
  }

  /**
   * Returns worktree persistence handlers.
   * Worktrees track lifecycle of git worktrees managed by the daemon.
   * Filesystem operations live in the daemon, not in the datastore.
   */
  public get worktrees() {
    return bindWorktreeOperationGroup(this.operationBinder());
  }

  /**
   * Returns workspace persistence handlers.
   * Workspaces describe an on-disk path an agent can operate within.
   * A workspace optionally references a worktree.
   */
  public get workspaces() {
    return bindWorkspaceOperationGroup(this.operationBinder());
  }

  /**
   * Returns task-board persistence handlers.
   * Each board owns pools, tasks, and dependencies that the daemon's
   * TaskBoardService loads into the in-memory engine.
   */
  public get taskBoards() {
    return bindTaskBoardOperationGroup(this.operationBinder());
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
