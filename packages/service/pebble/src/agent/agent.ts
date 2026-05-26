import { Events } from '@two-pebble/events';
import type { AgentBridge } from '../bridge';
import type { DataCells } from '../thread';
import type { AgentEvents } from './events';
import type { AgentInput, AgentStatus } from './types';

/**
 * This is an abstract class that all agents must extend, allowing our system to hook into every "agent" regardless of how the agent itself is implemented
 * This class exposes the agent's lifecycle to listeners, exposes tools, and exposes traces.
 */
export abstract class Agent extends Events<AgentEvents> {
  // The agent's id for tracking, this is the agent's id in the database, also called instance id
  public readonly agentId: string;

  // Name and description of the agent
  public readonly name: string;
  public readonly description: string;

  // Status tracking
  private status: AgentStatus = 'idle';

  // Agents have a queue of incoming messages they can pull from as needed
  // Callers can simply push messages into the queue and the agent will pull them as possible
  private incomingMessageQueue: DataCells[] = [];

  // Agents have a workspace they are bound to
  public readonly workspacePath: string;

  public readonly bridge: AgentBridge;

  // Single-shot abort controller wired into the agent's lifecycle. Subclasses can
  // pass `abortSignal` down to in-flight async work (model calls, framework
  // sessions) so a manual stop interrupts cooperatively. Once aborted the
  // controller stays aborted — agents are not reused after a stop.
  private readonly abortController = new AbortController();
  private stopping = false;

  public constructor(input: AgentInput) {
    super();
    this.agentId = input.agentId;
    this.name = input.name;
    this.description = input.description;
    this.workspacePath = input.workspacePath;
    this.bridge = input.bridge;
  }

  /** AbortSignal that fires when `stop()` is called. */
  public get abortSignal(): AbortSignal {
    return this.abortController.signal;
  }

  /**
   * Manually stops the agent. Idempotent: a second call is a no-op so callers
   * (daemon, capabilities, tools) don't have to coordinate.
   *
   * Order of effects:
   *   1. Flip the AbortController so cooperative async work bails out.
   *   2. Delegate to the subclass-specific `onStop` hook (framework session
   *      teardown for FrameworkAgent, run-loop quiescence for PebbleAgent).
   *   3. Transition to `idle` if the subclass didn't already land on a
   *      terminal state, so the runtime status reflects the stop without
   *      leaving the agent in `running`/`waiting` limbo.
   */
  public async stop(reason: string): Promise<void> {
    if (this.stopping) {
      return;
    }
    this.stopping = true;
    if (!this.abortController.signal.aborted) {
      this.abortController.abort(reason);
    }
    try {
      await this.onStop(reason);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.changeStatus('failed', `stop failed: ${message}`);
      throw error;
    }
    const current = this.status;
    if (current !== 'idle' && current !== 'failed' && current !== 'offline') {
      this.changeStatus('idle', `stopped: ${reason}`);
    }
  }

  /**
   * Subclass-specific stop work. Runs after the abort signal has been raised
   * and before the base class settles status to `idle`. Default is a no-op so
   * subclasses without dedicated teardown still inherit a working `stop()`.
   */
  protected async onStop(_reason: string): Promise<void> {
    return;
  }

  /**
   * Queues a user or parent message for the agent.
   * The message event wakes implementations that are waiting for inbound work.
   */
  public sendMessage(message: DataCells): void {
    this.incomingMessageQueue.push(message);
    this.emit('message');
    // TODO some sort of incoming message trace emit
  }

  protected peakMessages(): boolean {
    return this.incomingMessageQueue.length > 0;
  }

  protected pullAllMessages(): DataCells {
    const messages = this.incomingMessageQueue.flat();
    this.incomingMessageQueue = [];
    // TODO some sort of read message trace
    return messages;
  }

  protected pullMessage(): DataCells | undefined {
    // TODO some sort of read message trace
    return this.incomingMessageQueue.shift();
  }

  // Status life
  protected changeStatus(status: AgentStatus, message: string) {
    this.status = status;
    this.emit('status', { status, message });
    // TODO some sort of status lifecycle trace emit
  }

  protected getStatus(): AgentStatus {
    return this.status;
  }
}
