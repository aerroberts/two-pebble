import type { AgentSignal } from '../../agent';
import { AgentExitHook, ToolResponse } from '../../agent';
import type { DataCells } from '../../thread';
import { Cell } from '../../thread';
import type { ParentMessageDirection } from '../../traces';
import { AgentCapability } from '../agent-capability';
import { buildAskParentAgentTool } from './tools/ask-parent-agent/handler';
import { buildNotifyParentAgentTool } from './tools/notify-parent-agent/handler';
import { buildReadParentAgentMessagesTool } from './tools/read-parent-agent-messages/handler';
import { buildRespondToParentAgentTool } from './tools/respond-to-parent-agent/handler';
import { objectData, stringField } from './utils/parent-link-signal-data';
import type { ParentLinkCapabilityConfig, PendingParentResponse } from './utils/parent-link-types';

/**
 * Capability installed on child agents so they can talk to their parent.
 *
 * It routes messages through durable agent signals instead of in-memory queues.
 */
export class ParentLinkCapability extends AgentCapability<ParentLinkCapabilityConfig> {
  public readonly id = 'parent-link';
  public readonly description = 'Lets a Pebble child agent message its parent.';
  private readonly parentAgentIdSlot = this.useState<string | null>('parent-agent-id', null);
  private readonly pendingParentResponseSlot = this.useState<PendingParentResponse | null>(
    'pending-parent-response',
    null,
  );

  /**
   * Stores the parent id provided at child launch.
   *
   * The id can later be overridden by a pending response context.
   */
  public override initialize(config: ParentLinkCapabilityConfig): void {
    if (typeof config.parentAgentId === 'string') {
      this.parentAgentIdSlot.set(config.parentAgentId);
    }
  }

  /**
   * Registers parent messaging tools for the child agent.
   *
   * Tool calls either send one-way push signals or register awaited responses.
   */
  public override hookOnRegister() {
    return {
      tools: [
        buildNotifyParentAgentTool(this),
        buildAskParentAgentTool(this),
        buildReadParentAgentMessagesTool(this),
        buildRespondToParentAgentTool(this),
      ],
    };
  }

  /**
   * Handles parent-originated signals delivered to this child.
   *
   * Parent asks block exit until the child responds through the matching tool.
   */
  public override hookOnSignal(signal: AgentSignal): void {
    const data = objectData(signal.data);
    const type = stringField(data, 'type');
    if (type === 'parent-message') {
      const message = stringField(data, 'message');
      if (message !== undefined) {
        const content = [Cell.text(message)];
        this.traceParentMessage('message', content, undefined);
        this.agent.addUserContext('Parent Agent Message', content);
      }
      return;
    }
    if (type === 'respond-parent') {
      const message = stringField(data, 'message');
      const parentAgentId = stringField(data, 'parentAgentId');
      const parentCapabilityId = stringField(data, 'parentCapabilityId');
      const responseSignalId = stringField(data, 'responseSignalId');
      if (
        message === undefined ||
        parentAgentId === undefined ||
        parentCapabilityId === undefined ||
        responseSignalId === undefined
      ) {
        return;
      }
      this.pendingParentResponseSlot.set({ parentAgentId, parentCapabilityId, responseSignalId });
      const content = [
        Cell.header2('Parent Agent Ask'),
        Cell.text(message),
        Cell.text('Respond with respond-to-parent-agent before exiting.'),
      ];
      this.traceParentMessage('ask', content, parentAgentId);
      this.agent.addUserContext('Parent Agent Ask', content);
      return;
    }
    if (type === 'parent-response') {
      const message = stringField(data, 'message');
      if (message === undefined) {
        return;
      }
      const parentAgentId = stringField(data, 'parentAgentId');
      const parentCapabilityId = stringField(data, 'parentCapabilityId');
      const responseSignalId = stringField(data, 'responseSignalId');
      if (parentAgentId !== undefined && parentCapabilityId !== undefined && responseSignalId !== undefined) {
        this.pendingParentResponseSlot.set({ parentAgentId, parentCapabilityId, responseSignalId });
      } else {
        this.pendingParentResponseSlot.set(null);
      }
      const content = [Cell.header2('Parent Agent Response'), Cell.text(message)];
      this.traceParentMessage('response', content, parentAgentId);
      this.agent.addUserContext('Parent Agent Response', content);
    }
  }

  /**
   * Blocks exit while a parent question is waiting.
   *
   * This keeps awaited parent signals from being stranded.
   */
  public override hookOnAgentExit() {
    if (this.pendingParentResponseSlot.value !== null) {
      return AgentExitHook.denyExit('Respond to the parent agent before exiting.');
    }
    return AgentExitHook.permitExit();
  }

  private parentAgentId(): string {
    const pending = this.pendingParentResponseSlot.value;
    if (pending !== null) {
      return pending.parentAgentId;
    }
    const parentAgentId = this.parentAgentIdSlot.value;
    if (parentAgentId !== null) {
      return parentAgentId;
    }
    throw new Error('parent-link capability does not know its parent agent yet.');
  }

  public async notifyParent(message: string, expectsReply: boolean) {
    if (expectsReply) {
      return this.askParent(message);
    }
    await this.sendSignal({
      agentId: this.parentAgentId(),
      capabilityId: 'sub-agent',
      data: {
        childAgentId: this.agent.agentId,
        message,
        type: 'child-message',
      },
      description: 'Child agent sent a message to its parent.',
      name: 'Sub-agent message',
    });
    return ToolResponse.success([Cell.text('Sent message to parent.')]);
  }

  public async askParent(message: string) {
    const signalId = await this.registerSignal({
      description: 'Wait for parent agent to answer.',
      name: 'Parent response',
    });
    const pending = this.pendingParentResponseSlot.value;
    if (pending !== null) {
      await this.resolvePendingParentAsk(message, signalId, pending);
      this.pendingParentResponseSlot.set(null);
      return ToolResponse.success([Cell.text('Asked parent agent through the pending response signal and waiting.')]);
    }
    await this.sendAskParentSignal(message, signalId);
    return ToolResponse.success([Cell.text('Asked parent agent and waiting for a response.')]);
  }

  public async respondToParent(message: string) {
    const pending = this.pendingParentResponseSlot.value;
    if (pending === null) {
      return ToolResponse.error('No parent response is pending.', [Cell.text('No parent response is pending.')]);
    }
    await this.resolveSignal({
      agentId: pending.parentAgentId,
      capabilityId: pending.parentCapabilityId,
      data: {
        childAgentId: this.agent.agentId,
        message,
        type: 'sub-agent-response',
      },
      signalId: pending.responseSignalId,
    });
    this.pendingParentResponseSlot.set(null);
    return ToolResponse.success([Cell.text('Sent response to parent.')]);
  }

  private async sendAskParentSignal(message: string, responseSignalId: string): Promise<void> {
    await this.sendSignal({
      agentId: this.parentAgentId(),
      capabilityId: 'sub-agent',
      data: {
        childAgentId: this.agent.agentId,
        message,
        responseSignalId,
        type: 'ask-parent',
      },
      description: 'Child agent asked its parent for a response.',
      name: 'Sub-agent ask',
    });
  }

  private async resolvePendingParentAsk(
    message: string,
    responseSignalId: string,
    pending: PendingParentResponse,
  ): Promise<void> {
    await this.resolveSignal({
      agentId: pending.parentAgentId,
      capabilityId: pending.parentCapabilityId,
      data: {
        childAgentId: this.agent.agentId,
        message,
        responseSignalId,
        type: 'ask-parent',
      },
      signalId: pending.responseSignalId,
    });
  }

  private traceParentMessage(
    direction: ParentMessageDirection,
    content: DataCells,
    parentAgentId: string | undefined,
  ): void {
    this.agent.emit('trace', {
      type: 'parent-message',
      data: {
        content,
        direction,
        ...(parentAgentId === undefined ? {} : { parentAgentId }),
      },
    });
  }
}
