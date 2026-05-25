import type {
  AgentRegistryRecord,
  Datastore,
  InferenceProfileRecord,
  IntegrationRecord,
  ThirdPartyAgentInstallRecord,
} from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type {
  Agent,
  AgentBridge,
  CellContent,
  PebbleAgentConversationCell,
  PebbleAgentRestoredThread,
  PebbleAgentTrace,
  PebbleJsonRecord,
  PebbleJsonValue,
  PricingLineItem,
  ProviderResult,
  SubAgentLifecycleEvent,
  SubAgentTraceEvent,
  SubAgentUsageEvent,
  UsageReport,
} from '@two-pebble/pebble';
import type { DaemonBridge } from '../types';
import type { SubAgentCreatePromiseMap } from './agent-registry-sub-agents';
import type { TaskBoardService } from './task-board-service';

export interface ExtraCapabilitySpec {
  id: string;
  config: PebbleJsonValue;
}

export interface LaunchAgentInput {
  agentRegistryId: string;
  message: string;
  /**
   * Structured cells from the rich composer. When present, takes precedence
   * over `message` for delivering the first turn to the agent.
   */
  cells?: CellContent[];
  /**
   * Optional parent agent id. Set when this launch is for a sub-agent
   * spawned by a parent's `SubAgentCapability`. The daemon stores it on
   * the agents row and auto-attaches `ParentLinkCapability` on top of
   * the registry-declared capability list.
   */
  parentAgentId?: string;
  /**
   * Optional capability specs to attach in addition to whatever the
   * registry row declares. Used by the dispatcher and delegate handler to
   * bind `task-lifecycle` to a specific task at launch time.
   */
  extraCapabilities?: ExtraCapabilitySpec[];
}

export interface ResolvedLaunchWorkspace {
  workspace: ResolvedWorkspace;
  worktree?: ResolvedWorktree;
}

export interface ResolvedWorkspace {
  id: string;
  path: string;
}

export interface ResolvedWorktree {
  branch: string;
  id: string;
  path: string;
  repositoryId: string;
}

export interface RunAgentInput {
  agent: Agent;
  agentId: string;
  bridge: DaemonBridge;
  message: string;
  /**
   * Structured cells from the rich composer for the initial turn. When
   * present, the daemon delivers these to the agent instead of wrapping
   * `message` as a single text cell.
   */
  cells?: CellContent[];
  /**
   * Optional registry record. Present on the fresh-launch path so the
   * orchestrator can register Pebble capabilities; absent when re-using
   * the run flow from rehydrate, which registers capabilities itself.
   */
  registry?: AgentRegistryRecord;
  /**
   * Optional parent agent id. When set, the daemon auto-attaches the
   * `parent-link` capability on top of the registry-declared list.
   */
  parentAgentId?: string;
  /**
   * Inference profile and integration ids the agent was launched under.
   * Carried so the persistence listener can tag every price line item and
   * model call written for this run, which lets downstream metrics group
   * cost by profile or integration.
   */
  inferenceProfileId?: string;
  integrationId?: string;
  workspaceId: string;
  /**
   * Carried from `LaunchAgentInput` so the fresh-launch installer can
   * concat these onto the registry-declared spec list before capabilities
   * are attached.
   */
  extraCapabilities?: ExtraCapabilitySpec[];
}

export type NextAgentTraceOrderId = () => number;

export interface AgentListenerContext {
  datastore: Datastore;
  logger: Logger;
  pending: SubAgentCreatePromiseMap;
  taskBoards: TaskBoardService;
  persistAgentStatus(input: PersistAgentStatusInput): Promise<void>;
  recordConversationCell(input: RecordConversationCellInput): Promise<void>;
  recordModelCall(input: RecordModelCallInput): Promise<void>;
  recordPriceLineItem(input: RecordPriceLineItemInput): Promise<void>;
  recordTrace(input: RecordTraceInput): Promise<void>;
}

export interface AgentListenerInstallInput {
  context: AgentListenerContext;
  input: RunAgentInput;
  nextOrderId: NextAgentTraceOrderId;
}

export interface BuildLaunchAgentInput_Pebble {
  agentId: string;
  bridge: AgentBridge;
  description: string;
  inferenceProfile: InferenceProfileRecord;
  integration: IntegrationRecord;
  kind: 'pebble';
  registry: AgentRegistryRecord;
  /**
   * Resume metadata previously persisted under the agent record. The launch
   * path passes `{}` for new agents; rehydrate replays the stored snapshot
   * so the framework can pick its session back up.
   */
  resumeMetadata: PebbleJsonRecord;
  /**
   * Pre-existing thread cells for Pebble agents on the rehydrate path.
   * Absent for fresh launches (the agent boots a fresh thread on its
   * first submitMessage instead).
   */
  restoredThread?: PebbleAgentRestoredThread;
  workspacePath: string;
}

export interface BuildLaunchAgentInput_Framework {
  agentId: string;
  bridge: AgentBridge;
  description: string;
  install: ThirdPartyAgentInstallRecord;
  kind: 'framework';
  registry: AgentRegistryRecord;
  /** Resume metadata previously persisted under the agent record. */
  resumeMetadata: PebbleJsonRecord;
  workspacePath: string;
}

export type BuildLaunchAgentInput = BuildLaunchAgentInput_Pebble | BuildLaunchAgentInput_Framework;

export type AgentLifecycleStatus = 'idle' | 'running' | 'waiting' | 'interrupted' | 'offline' | 'failed';

export interface PersistAgentStatusInput {
  agentId: string;
  bridge: DaemonBridge;
  status: AgentLifecycleStatus;
}

export interface RecordTraceInput {
  agentId: string;
  bridge: DaemonBridge;
  orderId: number;
  trace: PebbleAgentTrace;
  workspaceId: string;
}

export interface RecordModelCallInput {
  agentId: string;
  bridge: DaemonBridge;
  call: ProviderResult;
  inferenceProfileId?: string;
  integrationId?: string;
}

export interface RecordConversationCellInput {
  agentId: string;
  cell: PebbleAgentConversationCell;
}

export interface RecordPriceLineItemInput {
  agentId: string;
  bridge: DaemonBridge;
  lineItem: PricingLineItem;
  inferenceProfileId?: string;
  integrationId?: string;
}

export interface EmitWorktreeInitializedInput {
  agentId: string;
  bridge: DaemonBridge;
  datastore: Datastore;
  worktree: ResolvedWorktree;
}

export interface RecordSubAgentTraceInput {
  bridge: DaemonBridge;
  event: SubAgentTraceEvent;
  orderId: number;
  parentAgentId: string;
  workspaceId: string;
}

export interface EnsureSubAgentInput {
  bridge: DaemonBridge;
  event: SubAgentLifecycleEvent | SubAgentTraceEvent | SubAgentUsageEvent;
  parentAgentId: string;
  workspaceId: string;
}

export interface RecordSubAgentUsageInput {
  bridge: DaemonBridge;
  event: SubAgentUsageEvent;
  parentAgentId: string;
  usage: UsageReport;
  workspaceId: string;
}

export interface StopSubAgentInput {
  bridge: DaemonBridge;
  event: SubAgentLifecycleEvent;
  parentAgentId: string;
  workspaceId: string;
}

export interface ResolveBuildInputInput {
  registry: AgentRegistryRecord;
}

export interface ResolveBuildInputResult {
  description: string;
  registry: AgentRegistryRecord;
  /**
   * Partial build-launch input. The launch and rehydrate paths add
   * `agentId`, `resumeMetadata`, and `workspacePath` themselves before
   * passing this to `buildLaunchAgent`.
   */
  params: BuildLaunchAgentParams;
}

export interface BuildLaunchAgentParams_Pebble {
  description: string;
  inferenceProfile: InferenceProfileRecord;
  integration: IntegrationRecord;
  kind: 'pebble';
  registry: AgentRegistryRecord;
}

export interface BuildLaunchAgentParams_Framework {
  description: string;
  install: ThirdPartyAgentInstallRecord;
  kind: 'framework';
  registry: AgentRegistryRecord;
}

export type BuildLaunchAgentParams = BuildLaunchAgentParams_Pebble | BuildLaunchAgentParams_Framework;

export interface ResolveLaunchWorkspaceInput {
  bridge: DaemonBridge;
  datastore: Datastore;
  logger: Logger;
  multicastBridge: DaemonBridge;
  registry: AgentRegistryRecord;
}

export interface ParseWorkspaceConfigInput {
  logger: Logger;
  registry: AgentRegistryRecord;
}
