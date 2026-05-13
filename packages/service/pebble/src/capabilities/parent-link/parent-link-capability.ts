import type { AgentSignal } from '../../agent';
import { AgentExitHook, NativeTool, ToolResponse } from '../../agent';
import { Cell } from '../../thread';
import { AgentCapability } from '../agent-capability';
import { notifyParentSchema, parentMessageSchema, readParentMessagesSchema } from './parent-link-schemas';
import { objectData, stringField } from './parent-link-signal-data';
import type { ParentLinkCapabilityConfig, PendingParentResponse } from './parent-link-types';

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
    if (typeof config.parentAgentId === 'string') this.parentAgentIdSlot.set(config.parentAgentId);
  }

  /**
   * Registers parent messaging tools for the child agent.
   *
   * Tool calls either send one-way push signals or register awaited responses.
   */
  public override hookOnRegister() {
    return {
      tools: [
        new NativeTool({
          description: 'Send a message to the parent agent.',
          name: 'notify-parent-agent',
          schema: notifyParentSchema,
        }).onInvoke(async (input) => {
          const data = {
            childAgentId: this.agent.agentId,
            message: input.message,
            type: 'child-message' as const,
          };
          await this.sendSignal({
            agentId: this.parentAgentId(),
            capabilityId: 'sub-agent',
            data,
            description: 'Child agent sent a message to its parent.',
            name: input.expectsReply === true ? 'Sub-agent ask' : 'Sub-agent message',
          });
          return ToolResponse.success([Cell.text('Sent message to parent.')]);
        }),
        new NativeTool({
          description: 'Ask the parent agent a question and wait for its reply.',
          name: 'ask-parent-agent',
          schema: parentMessageSchema,
        }).onInvoke(async (input) => {
          const signalId = await this.registerSignal({
            description: 'Wait for parent agent to answer.',
            name: 'Parent response',
          });
          const data = {
            childAgentId: this.agent.agentId,
            message: input.message,
            responseSignalId: signalId,
            type: 'ask-parent' as const,
          };
          await this.sendSignal({
            agentId: this.parentAgentId(),
            capabilityId: 'sub-agent',
            data,
            description: 'Child agent asked its parent for a response.',
            name: 'Sub-agent ask',
          });
          return ToolResponse.success([Cell.text('Asked parent agent and waiting for a response.')]);
        }),
        new NativeTool({
          description: 'Read queued parent messages without waiting.',
          name: 'read-parent-agent-messages',
          schema: readParentMessagesSchema,
        }).onInvoke(() =>
          ToolResponse.success([Cell.text('No queued parent messages. Signal responses resume the agent.')]),
        ),
        new NativeTool({
          description: 'Respond to the parent agent.',
          name: 'respond-to-parent-agent',
          schema: parentMessageSchema,
        }).onInvoke(async (input) => {
          const pending = this.pendingParentResponseSlot.value;
          if (pending === null) {
            return ToolResponse.error('No parent response is pending.', [Cell.text('No parent response is pending.')]);
          }
          const data = {
            childAgentId: this.agent.agentId,
            message: input.message,
            type: 'sub-agent-response' as const,
          };
          await this.resolveSignal({
            agentId: pending.parentAgentId,
            capabilityId: pending.parentCapabilityId,
            data,
            signalId: pending.responseSignalId,
          });
          this.pendingParentResponseSlot.set(null);
          return ToolResponse.success([Cell.text('Sent response to parent.')]);
        }),
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
      if (message !== undefined) this.agent.addUserContext('Parent Agent Message', [Cell.text(message)]);
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
      this.agent.addUserContext('Parent Agent Ask', [
        Cell.header2('Parent Agent Ask'),
        Cell.text(message),
        Cell.text('Respond with respond-to-parent-agent before exiting.'),
      ]);
      return;
    }
    if (type === 'parent-response') {
      const message = stringField(data, 'message');
      if (message === undefined) return;
      this.agent.addUserContext('Parent Agent Response', [Cell.header2('Parent Agent Response'), Cell.text(message)]);
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
    if (pending !== null) return pending.parentAgentId;
    const parentAgentId = this.parentAgentIdSlot.value;
    if (parentAgentId !== null) return parentAgentId;
    throw new Error('parent-link capability does not know its parent agent yet.');
  }
}
