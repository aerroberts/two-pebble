import type { Client } from '@libsql/client';
import type {
  AgentRegistryKind,
  AppSettings,
  InferenceProfile,
  Integration,
  ThirdPartyAgentFrameworkId,
  ThirdPartyAgentInstall,
  WorkspaceConfig,
} from '@two-pebble/datatypes';
import type { PebbleJsonValue } from '@two-pebble/pebble';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import type { Datastore } from './datastore';
import type {
  agentCallsTable,
  agentConversationCellsTable,
  agentPriceLineItemsTable,
  agentRegistriesTable,
  agentSignalsTable,
  agentsTable,
  agentTracesTable,
  appSettingsTable,
  automationsTable,
  documentsTable,
  heartbeatsTable,
  inferenceProfilesTable,
  integrationsTable,
  metricsTable,
  repositoriesTable,
  taskBoardsTable,
  taskDeliverableSubmissionsTable,
  taskDeliverablesTable,
  taskDependenciesTable,
  taskEventsTable,
  taskPoolsTable,
  tasksTable,
  taskTemplateDeliverablesTable,
  taskTemplatesTable,
  thirdPartyAgentInstallsTable,
  workspacesTable,
  worktreesTable,
} from './schema';

export type IntegrationProvider = Integration['provider'];
export type IntegrationData = Integration['data'];
export type IntegrationRecord = Integration & {
  createdAt: number;
  id: string;
  name: string;
  updatedAt: number;
};
export type ThirdPartyAgentInstallFrameworkId = ThirdPartyAgentFrameworkId;
export type ThirdPartyAgentInstallData = ThirdPartyAgentInstall['data'];
export type ThirdPartyAgentInstallRecord = ThirdPartyAgentInstall & {
  createdAt: number;
  id: string;
  name: string;
  updatedAt: number;
};
export type InferenceProfileProvider = InferenceProfile['provider'];
export type InferenceProfileKind = InferenceProfile['kind'];
export type InferenceProfileData = InferenceProfile['data'];
export type InferenceProfileRecord = InferenceProfile & {
  createdAt: number;
  id: string;
  name: string;
  updatedAt: number;
};
export type AppSettingsRecord = AppSettings & {
  id: string;
  createdAt: number;
  updatedAt: number;
};

export interface DatastoreContext {
  database: DrizzleDatabase;
  databaseFilePath: string;
  datastore: Datastore;
  libsqlClient: LibsqlClient;
  schema: DatastoreSchema;
}

export type LibsqlClient = Client;

export interface DatastoreSchema extends Record<string, object> {
  agentConversationCellsTable: typeof agentConversationCellsTable;
  agentPriceLineItemsTable: typeof agentPriceLineItemsTable;
  agentSignalsTable: typeof agentSignalsTable;
  agentCallsTable: typeof agentCallsTable;
  agentRegistriesTable: typeof agentRegistriesTable;
  agentTracesTable: typeof agentTracesTable;
  agentsTable: typeof agentsTable;
  appSettingsTable: typeof appSettingsTable;
  automationsTable: typeof automationsTable;
  documentsTable: typeof documentsTable;
  heartbeatsTable: typeof heartbeatsTable;
  inferenceProfilesTable: typeof inferenceProfilesTable;
  integrationsTable: typeof integrationsTable;
  metricsTable: typeof metricsTable;
  repositoriesTable: typeof repositoriesTable;
  taskBoardsTable: typeof taskBoardsTable;
  taskDependenciesTable: typeof taskDependenciesTable;
  taskDeliverableSubmissionsTable: typeof taskDeliverableSubmissionsTable;
  taskDeliverablesTable: typeof taskDeliverablesTable;
  taskEventsTable: typeof taskEventsTable;
  taskPoolsTable: typeof taskPoolsTable;
  taskTemplateDeliverablesTable: typeof taskTemplateDeliverablesTable;
  taskTemplatesTable: typeof taskTemplatesTable;
  tasksTable: typeof tasksTable;
  thirdPartyAgentInstallsTable: typeof thirdPartyAgentInstallsTable;
  worktreesTable: typeof worktreesTable;
  workspacesTable: typeof workspacesTable;
}

export type Wrappable<T> = (ctx: DatastoreContext) => T;
export type DrizzleDatabase = LibSQLDatabase<DatastoreSchema>;

export interface DatastoreInput {
  databaseFilePath: string;
}

export type DatastoreOperationHandler = (...args: object[]) => Promise<object | undefined>;

export interface DatastoreStatus {
  agentCallCount: number;
  agentCount: number;
  databaseFilePath: string;
  inferenceProfileCount: number;
  integrationCount: number;
}

export interface DatabaseDescription {
  path: string;
  tables: DatabaseTableDescription[];
}

export interface DatabaseQueryResult {
  columns: string[];
  rows: DatabaseQueryRow[];
  rowsAffected: number;
}

export type DatabaseColumnNames = string[];

export interface DatabaseQueryRow {
  [column: string]: DatabaseQueryValue;
}

export type DatabaseTableSizeMap = Map<string, number>;

export interface DatabaseTableDescription {
  name: string;
  rowCount: number;
  sizeBytes: number;
}

export type DatabaseQueryValue = boolean | null | number | string;

export type AgentStatus = 'idle' | 'running' | 'waiting' | 'interrupted' | 'offline' | 'failed';

export type AgentCallStatus = 'in_progress' | 'completed' | 'failed';

export type AgentSignalKind = 'awaited' | 'push';
export type AgentSignalStatus = 'open' | 'received' | 'resolved';

export interface AgentSignalRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  agentId: string;
  capabilityId: string;
  data: PebbleJsonValue;
  description: string;
  kind: AgentSignalKind;
  name: string;
  receivedAt: number | null;
  resolvedAt: number | null;
  signalId: string;
  status: AgentSignalStatus;
}

export type WorktreeStatus = 'creating' | 'active' | 'deleted';

export interface RepositoryRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  path: string;
  baseBranch: string;
}

export interface DocumentRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  content: string;
}

export interface WorktreeRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  repositoryId: string;
  branch: string;
  path: string;
  status: WorktreeStatus;
}

export interface WorkspaceRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  path: string;
  worktreeId: string | null;
}

export interface AgentRegistryRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  /**
   * Derived (not persisted): 'framework' when `thirdPartyAgentInstallId` is
   * set, 'pebble' otherwise. The datastore operations populate this for
   * callers so consumers don't have to compute it.
   */
  kind: AgentRegistryKind;
  inferenceProfileId: string | null;
  thirdPartyAgentInstallId: string | null;
  systemPrompt: string;
  /**
   * Serialized JSON list of `{ id, config }` capability specs the launch
   * flow attaches to each agent run. The wire shape is opaque to the
   * datastore; pebble validates and resolves it through `buildCapability`.
   */
  capabilities: string;
  /**
   * Serialized JSON workspace config. Discriminated union with kind
   * 'cwd' | 'fixed' | 'worktree'. The daemon parses this and resolves the
   * concrete workspace at launch.
   */
  workspaceConfig: string;
}

export type AgentRegistryWorkspaceConfig = WorkspaceConfig;

export interface TaskBoardRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
}

export interface TaskPoolRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  boardId: string;
  parentPoolId: string | null;
  name: string;
}

export interface TaskRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  boardId: string;
  poolId: string | null;
  name: string;
  description: string;
  templateId: string | null;
  additionalContext: string;
  ownerId: string | null;
  status: string;
}

export type TaskDeliverableType = 'text' | 'pr_url';

export interface TaskTemplateRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  boardId: string;
  name: string;
  prompt: string;
}

export interface TaskTemplateDeliverableRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  name: string;
  description: string;
  type: TaskDeliverableType;
  orderIndex: number;
}

export interface TaskDeliverableRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  taskId: string;
  name: string;
  description: string;
  type: TaskDeliverableType;
  orderIndex: number;
}

export interface TaskDeliverableSubmissionRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  taskId: string;
  deliverableId: string;
  payload: string;
  submittedAt: number;
}

export type TaskDeliverablePayload = { type: 'text'; content: string } | { type: 'pr_url'; url: string };

export interface TaskDependencyRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  boardId: string;
  fromId: string;
  toId: string;
}

export interface TaskEventRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  taskId: string;
  kind: string;
  status: string;
  reason: string;
  data: string;
}

export type AutomationIntervalUnit = 'manual' | 'minutes' | 'hours' | 'days';

export interface AutomationRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  agentRegistryId: string;
  message: string;
  intervalUnit: AutomationIntervalUnit;
  intervalValue: number;
  lastRanAt: number | null;
  enabled: boolean;
}

export interface HeartbeatReport {
  listenerId: string;
  kind: 'automation';
  outcome: 'fired' | 'skipped' | 'error';
  detail: Record<string, unknown>;
}

export interface HeartbeatRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  tickAt: number;
  durationMs: number;
  listenerCount: number;
  reports: HeartbeatReport[];
}

export type MetricDimensionsRecord = Record<string, string>;

export type MetricDimensionScalar = boolean | null | number | string;

export type MetricDimensionJsonRecord = Record<string, MetricDimensionScalar>;

export type MetricDimensionSource = bigint | boolean | null | number | object | string | undefined;

export interface MetricRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  value: number;
  dimensions: MetricDimensionsRecord;
}

export interface MetricAggregateBucket {
  bucketStart: number;
  sampleCount: number;
  min: number;
  max: number;
  avg: number;
  sum: number;
}

export interface MetricNameSummary {
  name: string;
  sampleCount: number;
  firstSeenAt: number;
  lastSeenAt: number;
}

export interface MetricVariant {
  dimensions: MetricDimensionsRecord;
  sampleCount: number;
  lastSeenAt: number;
}
