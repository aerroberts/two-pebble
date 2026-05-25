import type { ThirdPartyAgentFramework } from '../../frameworks/third-party-agent-framework';
import type { AgentFrameworkStatusEvent } from '../../frameworks/types';
import type { UsageReport } from '../../pricing';
import { staticPriceCalculator } from '../../pricing';
import type { DataCells } from '../../thread';
import { Cell } from '../../thread';
import type { PebbleAgentTrace } from '../../traces';
import type { PebbleJsonRecord } from '../../types';
import { Agent } from '../agent';
import type { AgentTraceData, AgentTraceType, ThirdPartyAgentConfig, ThreadCellInput } from '../types';

/**
 * A framework agent is provided by a third-party framework and owns its own
 * agentic loop. Pebble still wraps it so registry launch, traces, and CLI tool
 * dispatch work through the same daemon path as native agents.
 */
export class FrameworkAgent extends Agent {
  private readonly framework: ThirdPartyAgentFramework;
  private readonly systemPrompt: string;
  private systemMessageEmitted: boolean;
  private resumeMetadata: PebbleJsonRecord = {};
  // The most recent assistant message produced this turn. Reset on every
  // `working` edge so we never replay a stale message across turns; emitted
  // through `finalMessage` when the framework settles into idle.
  private lastAssistantMessage: DataCells | undefined;

  constructor(config: ThirdPartyAgentConfig) {
    super({
      agentId: config.agentId,
      bridge: config.bridge,
      description: config.description,
      name: config.name,
      workspacePath: config.workspacePath,
    });

    this.framework = config.framework;
    this.systemPrompt = config.systemPrompt;
    this.systemMessageEmitted = !config.freshLaunch;
    this.framework.onUsage((usage) => this.emitUsage(usage));
    this.framework.onTrace((type, data) => {
      if (type === 'assistant-message') {
        // The framework emits this as a debug trace; we additionally memo it
        // here so the idle edge has something concrete to hand back via the
        // `finalMessage` event without consumers having to subscribe to traces.
        const assistantData = data as AgentTraceData<'assistant-message'>;
        this.lastAssistantMessage = assistantData.content;
      }
      this.emitTrace(type, data);
    });
    this.framework.onStatusChange((event) => this.onFrameworkStatusChange(event));
    this.framework.onMetadataUpdate((metadata) => {
      this.resumeMetadata = metadata;
      this.emit('metadata', metadata);
    });
    this.framework.onSubAgentStart((event) => this.emit('subAgentStart', event));
    this.framework.onSubAgentStop((event) => this.emit('subAgentStop', event));
    this.framework.onSubAgentTrace((event) => this.emit('subAgentTrace', event));
    this.framework.onSubAgentUsage((event) => this.emit('subAgentUsage', event));

    this.on('message', () => this.onIncomingMessage());
  }

  /**
   * Forwards caller-supplied context cells into the framework as a
   * follow-up message. Frameworks own their own context window and don't
   * expose a thread, so the only way to inject cells the model will see
   * is to submit them as user input. The label is currently informational.
   */
  public addUserContext(_label: string, input: ThreadCellInput): void {
    const cells = Array.isArray(input) ? input : [input];
    void this.framework.submitMessage({
      input: cells,
      systemPrompt: this.systemPrompt,
      workspacePath: this.workspacePath,
    });
  }

  /**
   * Drains the incoming queue and submits the messages to the underlying
   * framework. Routing (fresh session vs follow-up into the live session)
   * is the adapter's job, not the agent's, because the agent's status is
   * not the same as the adapter's session state.
   */
  private onIncomingMessage(): void {
    const messages = this.pullAllMessages();
    if (messages.length === 0) {
      return;
    }
    if (this.getStatus() === 'failed') {
      throw new Error(`agent is ${this.getStatus()} and cannot accept messages`);
    }

    void this.framework.submitMessage({
      input: messages,
      systemPrompt: this.systemPrompt,
      workspacePath: this.workspacePath,
    });
    this.emitTrace('user-message', { content: messages });
  }

  /**
   * Reflects the underlying framework's runtime state into the agent's own
   * lifecycle. Working ⇒ running, idle ⇒ idle, idle+error ⇒ failed.
   * The system-prompt trace is emitted at most once per agent so observers
   * see what context the session was started with — re-emitting on every
   * resume (within-daemon or after rehydrate) would just duplicate it.
   * On the idle edge we publish whatever assistant message the framework
   * produced this turn via `finalMessage` so consumers can react without
   * listening to traces.
   */
  private onFrameworkStatusChange(event: AgentFrameworkStatusEvent): void {
    if (event.status === 'working') {
      // New turn beginning — clear stale memo so a turn that produces no
      // assistant text doesn't accidentally re-emit the previous one.
      this.lastAssistantMessage = undefined;
      if (!this.systemMessageEmitted && this.systemPrompt.length > 0) {
        this.emitTrace('system-message', { content: [Cell.text(this.systemPrompt)] });
        this.systemMessageEmitted = true;
      }
      this.changeStatus('running', 'framework working');
      return;
    }
    if (event.error !== undefined) {
      this.changeStatus('failed', `framework error: ${event.error}`);
      return;
    }
    this.changeStatus('idle', 'framework idle');
    if (this.lastAssistantMessage !== undefined) {
      const content = this.lastAssistantMessage;
      this.lastAssistantMessage = undefined;
      this.emit('finalMessage', { content });
    }
  }

  /**
   * Soft-stops the agent. Forwards the request to the underlying framework
   * (frameworks without an interrupt API are no-ops by default) and flips
   * status to idle unconditionally so the persistence listener writes the
   * change to the durable record — the in-memory status can lag the DB
   * after rehydrate, so gating on the in-memory value would skip the
   * write in the common stale-agent case.
   */
  public async stop(reason: string): Promise<void> {
    await this.framework.stop(reason);
    this.changeStatus('idle', `stopped: ${reason}`);
  }

  /**
   * Returns framework resume metadata persisted on the agent row.
   * The daemon records this after framework launches so later rehydrates
   * can resume the same third-party session.
   */
  public getResumeMetadata() {
    return this.resumeMetadata;
  }

  /**
   * Probes the underlying framework and reconciles silent settlement.
   * When the framework reports `settled: 'idle'` but this agent still
   * thinks it is running, flip the durable status here — that's the
   * silent-death case where the adapter's iterator exited without
   * firing `onStatusChange(idle)`.
   */
  public async probe() {
    const result = await this.framework.probe();
    if (result.settled === 'idle' && this.getStatus() === 'running') {
      this.changeStatus('idle', 'framework settled silently');
    }
    return result;
  }

  private emitTrace<TType extends AgentTraceType>(type: TType, data: AgentTraceData<TType>): void {
    this.emit('trace', { type, data } as PebbleAgentTrace);
  }

  private emitUsage(usage: UsageReport): void {
    const report = staticPriceCalculator.calculate(`${usage.provider}/${usage.modelId}`, usage.usage);
    for (const lineItem of report.lineItems) {
      this.emit('lineItem', lineItem);
    }
  }
}
