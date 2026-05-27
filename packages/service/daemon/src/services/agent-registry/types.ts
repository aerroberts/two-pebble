import type {
  AgentRegistryRecord,
  Datastore,
  InferenceProfileRecord,
  IntegrationRecord,
  ThirdPartyAgentInstallRecord,
} from '@two-pebble/datastore';
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
  SubAgentMode,
  SubAgentTraceEvent,
  SubAgentUsageEvent,
  UsageReport,
} from '@two-pebble/pebble';
import type { DaemonEventSink } from '../../types';
import type { TaskBoardService } from '../task-board/service';
import type { SubAgentCreatePromiseMap } from './sub-agents';

export interface ExtraCapabilitySpec {
  id: string;
  config: PebbleJsonValue;
}

export interface LaunchAgentInput {
  agentRegistryId: string;
  message: string;
  projectId?: string;
  /**
   * Structured cells from the rich composer. When present, takes precedence
   * over `message` for delivering the first turn to the agent.
   */
  cells?: CellContent[];
  /**
   * Optional parent agent id. Set when this launch is for a sub-agent
   * spawned by a parent's `SubAgentCapability`. The daemon stores it on
   * the agents row so the relationship can be inspected and persisted.
   */
  parentAgentId?: string;
  parentSubAgent?: ParentSubAgentLink;
  /**
   * Optional capability specs to attach in addition to whatever the
   * registry row declares.
   */
  extraCapabilities?: ExtraCapabilitySpec[];
  workspaceOverride?: LaunchWorkspaceOverride;
}

export type LaunchWorkspaceOverride =
  | { kind: 'absolute'; path: string }
  | { kind: 'inherit'; workspaceId: string }
  | { kind: 'none' }
  | { kind: 'worktree'; parentWorkspaceId?: string; repositoryId?: string };

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
  events: DaemonEventSink;
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
   * Optional parent agent id recorded for launched child agents.
   */
  parentAgentId?: string;
  parentSubAgent?: ParentSubAgentLink;
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

export interface ParentSubAgentLink {
  childName: string;
  mode: SubAgentMode;
  parentAgentId: string;
}

export type NextAgentTraceOrderId = () => number;

export interface AgentListenerContext {
  datastore: Datastore;
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
  systemPrompt: string;
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
  systemPrompt: string;
  workspacePath: string;
}

export type BuildLaunchAgentInput = BuildLaunchAgentInput_Pebble | BuildLaunchAgentInput_Framework;

export type AgentLifecycleStatus = 'idle' | 'running' | 'waiting' | 'interrupted' | 'offline' | 'failed';

export interface PersistAgentStatusInput {
  agentId: string;
  events: DaemonEventSink;
  status: AgentLifecycleStatus;
}

export interface RecordTraceInput {
  agentId: string;
  events: DaemonEventSink;
  orderId: number;
  persistSubAgentRecordOnInvoke?: boolean;
  trace: PebbleAgentTrace;
  workspaceId: string;
}

export interface RecordModelCallInput {
  agentId: string;
  events: DaemonEventSink;
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
  events: DaemonEventSink;
  lineItem: PricingLineItem;
  inferenceProfileId?: string;
  integrationId?: string;
}

export interface EmitWorktreeInitializedInput {
  agentId: string;
  events: DaemonEventSink;
  datastore: Datastore;
  worktree: ResolvedWorktree;
}

export interface RecordSubAgentTraceInput {
  events: DaemonEventSink;
  event: SubAgentTraceEvent;
  orderId: number;
  parentAgentId: string;
  workspaceId: string;
}

export interface EnsureSubAgentInput {
  events: DaemonEventSink;
  event: SubAgentLifecycleEvent | SubAgentTraceEvent | SubAgentUsageEvent;
  parentAgentId: string;
  workspaceId: string;
}

export interface RecordSubAgentUsageInput {
  events: DaemonEventSink;
  event: SubAgentUsageEvent;
  parentAgentId: string;
  usage: UsageReport;
  workspaceId: string;
}

export interface StopSubAgentInput {
  events: DaemonEventSink;
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
  events: DaemonEventSink;
  datastore: Datastore;
  registry: AgentRegistryRecord;
  workspaceOverride?: LaunchWorkspaceOverride;
}

export interface ParseWorkspaceConfigInput {
  registry: AgentRegistryRecord;
}
