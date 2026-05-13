import { Events } from '@two-pebble/events';
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

  public constructor(input: AgentInput) {
    super();
    this.agentId = input.agentId;
    this.name = input.name;
    this.description = input.description;
    this.workspacePath = input.workspacePath;
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
