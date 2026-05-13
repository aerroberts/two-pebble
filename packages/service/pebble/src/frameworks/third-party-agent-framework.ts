import type { UsageReport } from '../pricing';
import type { PebbleAgentTraceByType } from '../traces';
import type {
  AgentFrameworkMetadata,
  AgentFrameworkMetadataListener,
  AgentFrameworkStatusEvent,
  AgentFrameworkStatusListener,
  AgentFrameworkSubmitMessageInput,
  FrameworkProbeResult,
  SubAgentLifecycleEvent,
  SubAgentLifecycleListener,
  SubAgentTraceEvent,
  SubAgentTraceListener,
  SubAgentUsageEvent,
  SubAgentUsageListener,
  TraceListener,
  UsageListener,
} from './types';

/**
 * Base abstraction for third-party agent frameworks.
 * Implementations own their SDK transport and publish Pebble trace/pricing events.
 * They also own their internal session state (cold/warm) and route every
 * `submitMessage` call accordingly.
 */
export abstract class ThirdPartyAgentFramework {
  public abstract readonly frameworkId: string;

  private readonly usageListeners: UsageListener[] = [];
  private readonly traceListeners: TraceListener[] = [];
  private readonly statusListeners: AgentFrameworkStatusListener[] = [];
  private readonly metadataListeners: AgentFrameworkMetadataListener[] = [];
  private readonly subAgentStartListeners: SubAgentLifecycleListener[] = [];
  private readonly subAgentStopListeners: SubAgentLifecycleListener[] = [];
  private readonly subAgentTraceListeners: SubAgentTraceListener[] = [];
  private readonly subAgentUsageListeners: SubAgentUsageListener[] = [];

  /**
   * Registers price line item observation.
   * Listeners receive framework and session metadata.
   * The adapter is returned for chaining in setup code.
   */
  public onUsage(listener: UsageListener) {
    this.usageListeners.push(listener);
    return this;
  }

  protected emitUsage(usage: UsageReport) {
    for (const listener of this.usageListeners) {
      listener(usage);
    }
  }

  /**
   * Registers trace event observation.
   * Listeners receive framework and session metadata.
   * The adapter is returned for chaining in setup code.
   */
  public onTrace(listener: TraceListener) {
    this.traceListeners.push(listener);
    return this;
  }

  protected emitTrace<T extends keyof PebbleAgentTraceByType>(type: T, data: PebbleAgentTraceByType[T]) {
    for (const listener of this.traceListeners) {
      listener(type, data);
    }
  }

  /**
   * Registers observation for runtime status changes.
   * Adapters fire this when their underlying tool starts working or returns
   * to an idle state. The wrapping FrameworkAgent uses this to drive
   * its durable status (running, idle, failed).
   */
  public onStatusChange(listener: AgentFrameworkStatusListener) {
    this.statusListeners.push(listener);
    return this;
  }

  protected emitStatusChange(event: AgentFrameworkStatusEvent) {
    for (const listener of this.statusListeners) {
      listener(event);
    }
  }

  /**
   * Registers observation for resume metadata snapshots.
   * Adapters fire this when they learn anything that a future process would
   * need to resume the same session (for Claude Code that's the SDK
   * `session_id`). The wrapper persists the snapshot under the durable
   * agent record so the next daemon can pass it back into the adapter.
   */
  public onMetadataUpdate(listener: AgentFrameworkMetadataListener) {
    this.metadataListeners.push(listener);
    return this;
  }

  protected emitMetadataUpdate(metadata: AgentFrameworkMetadata) {
    for (const listener of this.metadataListeners) {
      listener(metadata);
    }
  }

  /**
   * Registers observation for framework-owned sub-agent creation.
   * The lifecycle id is framework specific and maps to a durable child agent.
   */
  public onSubAgentStart(listener: SubAgentLifecycleListener) {
    this.subAgentStartListeners.push(listener);
    return this;
  }

  protected emitSubAgentStart(event: SubAgentLifecycleEvent) {
    for (const listener of this.subAgentStartListeners) {
      listener(event);
    }
  }

  /**
   * Registers observation for framework-owned sub-agent completion.
   * Listeners receive the same lifecycle id emitted by the start event.
   */
  public onSubAgentStop(listener: SubAgentLifecycleListener) {
    this.subAgentStopListeners.push(listener);
    return this;
  }

  protected emitSubAgentStop(event: SubAgentLifecycleEvent) {
    for (const listener of this.subAgentStopListeners) {
      listener(event);
    }
  }

  /**
   * Registers observation for traces produced inside framework sub-agents.
   * These traces are persisted under the child agent instead of the parent.
   */
  public onSubAgentTrace(listener: SubAgentTraceListener) {
    this.subAgentTraceListeners.push(listener);
    return this;
  }

  protected emitSubAgentTrace(event: SubAgentTraceEvent) {
    for (const listener of this.subAgentTraceListeners) {
      listener(event);
    }
  }

  /**
   * Registers observation for usage reported by framework sub-agents.
   * Pricing can then be attached to the durable child agent record.
   */
  public onSubAgentUsage(listener: SubAgentUsageListener) {
    this.subAgentUsageListeners.push(listener);
    return this;
  }

  protected emitSubAgentUsage(event: SubAgentUsageEvent) {
    for (const listener of this.subAgentUsageListeners) {
      listener(event);
    }
  }

  /**
   * Submits one user message to the underlying tool.
   * The adapter chooses internally whether to start a fresh session or
   * enqueue into a live one. The promise resolves when the message has been
   * accepted (not when the tool finishes); the surrounding turn boundary is
   * announced through onStatusChange.
   */
  public abstract submitMessage(input: AgentFrameworkSubmitMessageInput): Promise<void>;

  /**
   * Signals the underlying tool to stop its current work. Default is a no-op
   * so adapters that have no abort capability can opt out — the wrapping
   * FrameworkAgent always returns to idle regardless. Adapters with an
   * interrupt or cancel API should override this.
   */
  public async stop(_reason: string): Promise<void> {
    return;
  }

  /**
   * Reports what the adapter believes about its own activity. Default
   * impl returns idle so adapters that haven't been migrated yet still
   * function. Adapters should override and surface real iterator/session
   * state so the reconciler can detect silent settlement.
   */
  public async probe(): Promise<FrameworkProbeResult> {
    return { alive: false, settled: 'idle', lastActivityAt: 0 };
  }
}
