import type {
  SubAgentAskInput,
  SubAgentAwaitInput,
  SubAgentDrainInput,
  SubAgentKillInput,
  SubAgentMessage,
  SubAgentRunner,
  SubAgentRunnerChild,
  SubAgentSendInput,
  SubAgentSpawnInput,
} from '@two-pebble/pebble';
import { Cell } from '@two-pebble/pebble';
import type { ParentRunnerContext, PeerMessageEnvelope } from './runner-types';

/**
 * Daemon-side parent runner. Spawns children through the existing
 * AgentRegistryService.launch path, routes messages through the shared
 * coordinator, and exposes the contract `SubAgentCapability` calls into.
 */
export class ParentSideRunner implements SubAgentRunner {
  private readonly ctx: ParentRunnerContext;

  public constructor(ctx: ParentRunnerContext) {
    this.ctx = ctx;
  }

  /**
   * Resolves a reference name to its registry id and spawns a child
   * through the existing launch path. The new agent record's
   * `parent_agent_id` field is set so rehydrate can re-attach the
   * parent-link runner without consulting capability state.
   */
  public async spawn(input: SubAgentSpawnInput): Promise<string> {
    const registryId = this.ctx.references.get(input.referenceName);
    if (registryId === undefined) {
      throw new Error(`Unknown sub-agent reference name: ${input.referenceName}`);
    }
    const launched = await this.ctx.agentRegistry.launch({
      agentRegistryId: registryId,
      message: input.message,
      parentAgentId: this.ctx.parentAgentId,
    });
    return launched.id;
  }

  /**
   * Posts a message to the named child. Routes through the coordinator
   * which handles lazy rehydrate of the recipient and pending-pair
   * lookup before delivery. The envelope label and exit-blocker flag
   * are derived from `input.expectsReply`.
   */
  public async send(input: SubAgentSendInput): Promise<void> {
    const label = input.expectsReply ? 'Parent Agent Ask' : 'Parent Agent Message';
    await this.ctx.coordinator.deliver({
      recipientAgentId: input.childAgentId,
      message: this.message(input.message, { label, expectsReply: input.expectsReply }),
    });
  }

  /**
   * Sends and waits: posts the message as an ask and immediately enters
   * the await state. The parent's tool layer surfaces this as a single
   * tool call that returns the eventual reply when the child responds.
   */
  public async ask(input: SubAgentAskInput): Promise<SubAgentMessage> {
    await this.send({ childAgentId: input.childAgentId, expectsReply: true, message: input.message });
    return this.awaitMessage({ childAgentId: input.childAgentId, toolCallId: input.toolCallId });
  }

  /**
   * Waits for the next message in this parent's inbox, regardless of
   * source child. Resolves immediately if a message is already queued.
   */
  public async awaitMessage(_input: SubAgentAwaitInput): Promise<SubAgentMessage> {
    return this.ctx.coordinator.awaitNext({ recipientAgentId: this.ctx.parentAgentId });
  }

  /**
   * Returns any unread messages from the requested child without
   * waiting. The capability filters by source so the model only sees
   * traffic from the child it asked about.
   */
  public drain(input: SubAgentDrainInput): SubAgentMessage[] {
    return this.ctx.coordinator
      .drain({ recipientAgentId: this.ctx.parentAgentId })
      .filter((message) => message.fromAgentId === input.childAgentId);
  }

  /**
   * Marks a child terminated through the agent registry. Errors are
   * logged but do not throw — the model has already moved on.
   */
  public async kill(input: SubAgentKillInput): Promise<void> {
    try {
      await this.ctx.agentRegistry.terminate({ agentId: input.childAgentId, reason: input.reason });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.ctx.logger.warn('sub-agent kill failed', { childAgentId: input.childAgentId, error: message });
    }
  }

  /**
   * The capability is the source of truth for the parent's view of its
   * children; this method returns an empty list and exists only to
   * satisfy the SubAgentRunner interface contract.
   */
  public list(): SubAgentRunnerChild[] {
    return [];
  }

  private message(text: string, envelope: PeerMessageEnvelope): SubAgentMessage {
    return {
      content: [Cell.text(text)],
      expectsReply: envelope.expectsReply,
      fromAgentId: this.ctx.parentAgentId,
      label: envelope.label,
      receivedAt: Date.now(),
    };
  }
}
