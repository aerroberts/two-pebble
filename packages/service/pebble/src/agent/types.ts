import type { AgentBridge } from '../bridge';
import type { ThirdPartyAgentFramework } from '../frameworks/third-party-agent-framework';
import type { PricingLineItem, UsageReport } from '../pricing/types';
import type { ModelProvider } from '../providers/model-provider';
import type { ProviderResult } from '../providers/types';
import type { CellContent, ConversationThreadCell, DataCells } from '../thread/index';
import type { PebbleAgentTrace, PebbleAgentTraceByType } from '../traces';
import type { PebbleJsonRecord, PebbleJsonValue } from '../types';
import type { AgentTool } from './tools/agent-tool';
import type { ToolInput } from './tools/tool-input';

export interface AgentInput {
  agentId: string;
  bridge: AgentBridge;
  name: string;
  description: string;
  workspacePath: string;
}

export type PebbleAgentRemovalReason = string | null;
export type ToolInvocationSource = 'cli' | 'framework' | 'native';
export type ThreadCellInput = CellContent | DataCells;
export type AgentProviderOutputBlock = ProviderResult['output'][number];
export type AgentTraceType = keyof PebbleAgentTraceByType & string;
export type AgentTraceData<TType extends AgentTraceType> = PebbleAgentTraceByType[TType];

export interface AgentExitPermitted {
  permitExit: true;
}

export interface AgentExitDenied {
  permitExit: false;
  reason: string;
}

export type AgentExitHookResult = AgentExitPermitted | AgentExitDenied;

export interface PebbleAgentConfig {
  agentId: string;
  bridge: AgentBridge;
  name: string;
  description: string;
  workspacePath: string;
  provider: ModelProvider;
  systemPrompt?: string;
  restoredThread?: PebbleAgentRestoredThread;
}

export interface PebbleAgentRestoredThread {
  threadId: string;
  cells: ConversationThreadCell[];
}

export interface ThirdPartyAgentConfig {
  agentId: string;
  bridge: AgentBridge;
  name: string;
  description: string;
  framework: ThirdPartyAgentFramework;
  systemPrompt: string;
  workspacePath: string;
  /**
   * False on the rehydrate path, true on a fresh launch. Controls whether
   * the initial system-message trace is emitted on the first idle→running
   * edge; a rehydrated framework agent already has that trace persisted
   * from the original launch, so re-emitting on every resume just
   * duplicates the entry.
   */
  freshLaunch: boolean;
}

export type PebbleAgentConversationCell = ConversationThreadCell & {
  threadId: string;
};

export interface AttemptedExitResult {
  blockingExit: boolean;
}

export interface AgentStepResult {
  anyToolsWereExecuted: boolean;
}

export type PebbleAgentRegisterCapabilityOptions =
  | { mode: 'fresh'; config: PebbleJsonValue }
  | { mode: 'rehydrate'; restoredSlots: Map<string, PebbleJsonValue> };

export interface PebbleAgentToolResultInput {
  toolCallId: string;
  toolId: string;
  content: DataCells;
}

export interface PebbleAgentPeerMessageInput {
  content: DataCells;
  expectsReply: boolean;
  fromAgentId: string;
  label: string;
  receivedAt: number;
}

export interface PeerMessageEvent {
  expectsReply: boolean;
  fromAgentId: string;
  label: string;
  receivedAt: number;
}

export type PeerMessageListener = (event: PeerMessageEvent) => void;

export interface RunTurnsOptions {
  /**
   * Resume the agentic loop without first appending a user message.
   * Used when a waiting tool call has just been paired by `submitToolResult`
   * — the thread already has the awaited content; the model just needs
   * another iteration to react.
   */
  resumeImmediately?: boolean;
}

export interface InvokeModelResult {
  threadCellPointer: string;
  toolCalls: PebbleToolCall[];
}

export interface InvokeModelToolBlock {
  type: 'tool';
  id: string;
  tool: string;
  input: ToolInput;
}

export interface PebbleToolCall {
  id: string;
  type: 'native' | 'cli';
  toolId: string;
  input: ToolInput;
}

export interface InvokeModelToolCall {
  block: PebbleToolCall;
  source: ToolInvocationSource;
}

export interface AgentToolRegistration {
  capabilityId: string | null;
  tool: AgentTool;
}

export interface PebbleAgentToolInvocation {
  appendResultToThread: boolean;
  callId?: string;
  emitStartTrace: boolean;
  input: ToolInput;
  source: ToolInvocationSource;
  toolId: string;
}

export interface FailedToolInvocationInput {
  appendResultToThread: boolean;
  callId: string;
  error: string;
  source: ToolInvocationSource;
  toolId: string;
}

export interface CapabilityStateSnapshotInput {
  capabilityId: string;
  name: string;
  value: PebbleJsonValue;
}

export interface CapabilityStateSnapshot {
  capabilityId: string;
  name: string;
  value: PebbleJsonValue;
}

export type AgentStatus = 'idle' | 'running' | 'waiting' | 'interrupted' | 'failed' | 'offline';
export type AgentStatusEvent = { status: AgentStatus; message: string };

export type TraceListener = (trace: PebbleAgentTrace) => void;
export type ModelCallListener = (call: ProviderResult) => void;
export type LineItemListener = (lineItem: PricingLineItem) => void;
export type ThreadMessageListener = (cell: PebbleAgentConversationCell) => void;

export interface ProbeResult {
  alive: boolean;
  settled?: 'idle';
  lastActivityAt: number;
  hint?: string;
}

export type SubAgentStatus = 'running' | 'success' | 'error';

export interface SubAgentLifecycleEvent {
  agentInstanceId: string;
  agentTemplateId?: string;
  status?: SubAgentStatus;
}

export interface SubAgentTraceEvent {
  agentInstanceId: string;
  agentTemplateId?: string;
  trace: PebbleAgentTrace;
}

export interface SubAgentUsageEvent {
  agentInstanceId: string;
  agentTemplateId?: string;
  usage: UsageReport;
}

export type SubAgentLifecycleListener = (event: SubAgentLifecycleEvent) => void;
export type SubAgentTraceListener = (event: SubAgentTraceEvent) => void;
export type SubAgentUsageListener = (event: SubAgentUsageEvent) => void;
export type AgentResumeMetadata = PebbleJsonRecord;
