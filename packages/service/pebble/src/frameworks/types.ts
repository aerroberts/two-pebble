import type {
  SubAgentLifecycleEvent,
  SubAgentLifecycleListener,
  SubAgentStatus,
  SubAgentTraceEvent,
  SubAgentTraceListener,
  SubAgentUsageEvent,
  SubAgentUsageListener,
} from '../agent/types';
import type { UsageReport } from '../pricing/types';
import type { DataCells } from '../thread/types';
import type { PebbleAgentTraceByType } from '../traces';
import type { PebbleJsonRecord } from '../types';

export type {
  SubAgentLifecycleEvent,
  SubAgentLifecycleListener,
  SubAgentStatus,
  SubAgentTraceEvent,
  SubAgentTraceListener,
  SubAgentUsageEvent,
  SubAgentUsageListener,
};

export type UsageListener = (usage: UsageReport) => void;
export type TraceListener<T extends keyof PebbleAgentTraceByType = keyof PebbleAgentTraceByType> = (
  type: T,
  data: PebbleAgentTraceByType[T],
) => void;

export interface AgentFrameworkSubmitMessageInput {
  input: DataCells;
  /**
   * Prompt that should be applied when launching the third-party agent session.
   * The wrapper emits this as its own trace before the user input trace.
   */
  systemPrompt: string;
  /**
   * Path on disk the agent should operate within. Frameworks that spawn
   * subprocesses (e.g. Claude Code) use this as cwd.
   */
  workspacePath: string;
}

export type AgentFrameworkRuntimeStatus = 'working' | 'idle';

/**
 * Emitted by a framework adapter whenever its underlying tool starts or
 * finishes processing. The wrapper uses this to drive the durable agent
 * status. `error` is set when the tool stopped because something went wrong;
 * the agent translates that into a `failed` agent state.
 */
export interface AgentFrameworkStatusEvent {
  status: AgentFrameworkRuntimeStatus;
  error?: string;
}

export type AgentFrameworkStatusListener = (event: AgentFrameworkStatusEvent) => void;

/**
 * Opaque key/value blob a framework adapter publishes whenever it learns
 * something it would need to resume the session in a future process. The
 * wrapping FrameworkAgent persists the latest snapshot under the durable
 * agent record; the daemon does not introspect it.
 */
export type AgentFrameworkMetadata = PebbleJsonRecord;
export type AgentFrameworkMetadataListener = (metadata: AgentFrameworkMetadata) => void;

/**
 * Activity snapshot an adapter publishes when its wrapping FrameworkAgent is
 * probed. Identical in shape to the agent-level ProbeResult; the wrapper
 * passes the adapter's result through to the reconciler unchanged.
 */
export interface FrameworkProbeResult {
  alive: boolean;
  settled?: 'idle';
  lastActivityAt: number;
  hint?: string;
}
