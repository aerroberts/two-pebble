import type {
  ParentLinkAskInput,
  ParentLinkAwaitInput,
  ParentLinkNotifyInput,
  ParentLinkRunner,
  SubAgentMessage,
} from '@two-pebble/pebble';
import { Cell } from '@two-pebble/pebble';
import type { ChildRunnerContext, PeerMessageEnvelope } from './runner-types';

/**
 * Daemon-side child runner. Notifications and asks route up to the
 * parent through the shared coordinator; awaits resolve when the parent
 * eventually replies. Used by the auto-attached `ParentLinkCapability`.
 */
export class ChildSideRunner implements ParentLinkRunner {
  private readonly ctx: ChildRunnerContext;

  public constructor(ctx: ChildRunnerContext) {
    this.ctx = ctx;
  }

  /**
   * Posts a message up to the parent. Routes through the coordinator so
   * the parent's pending-ask pairing or queued inbox runs the same as
   * for parent → child traffic. Envelope label and exit-blocker flag
   * are derived from `input.expectsReply`.
   */
  public async notifyParent(input: ParentLinkNotifyInput): Promise<void> {
    const label = input.expectsReply ? 'Sub-Agent Ask' : 'Sub-Agent Message';
    await this.ctx.coordinator.deliver({
      recipientAgentId: this.ctx.parentAgentId,
      message: this.message(input.message, { label, expectsReply: input.expectsReply }),
    });
  }

  /**
   * Notifies and waits: posts the question as an ask and immediately
   * enters the await state. The child's tool layer surfaces this as a
   * single tool call that returns the parent's eventual reply.
   */
  public async askParent(input: ParentLinkAskInput): Promise<SubAgentMessage> {
    await this.notifyParent({ expectsReply: true, message: input.message });
    return this.awaitParentReply({ toolCallId: input.toolCallId });
  }

  /**
   * Waits for the next inbound message addressed to this child.
   * Resolves immediately if the inbox already has one queued.
   */
  public async awaitParentReply(_input: ParentLinkAwaitInput): Promise<SubAgentMessage> {
    return this.ctx.coordinator.awaitNext({ recipientAgentId: this.ctx.childAgentId });
  }

  /**
   * Returns any queued inbound messages without waiting. Used by the
   * child's read-parent-messages tool for non-blocking peek semantics.
   */
  public drainParentMessages(): SubAgentMessage[] {
    return this.ctx.coordinator.drain({ recipientAgentId: this.ctx.childAgentId });
  }

  private message(text: string, envelope: PeerMessageEnvelope): SubAgentMessage {
    return {
      content: [Cell.text(text)],
      expectsReply: envelope.expectsReply,
      fromAgentId: this.ctx.childAgentId,
      label: envelope.label,
      receivedAt: Date.now(),
    };
  }
}
