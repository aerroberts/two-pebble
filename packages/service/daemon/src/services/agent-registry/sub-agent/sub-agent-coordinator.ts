import type { Agent, DataCells } from '@two-pebble/pebble';
import { Cell, PebbleAgent } from '@two-pebble/pebble';
import type {
  AwaitNextInput,
  DeliverInput,
  DrainInput,
  InboxQueues,
  SubAgentCoordinatorContext,
  SubAgentMessage,
  SubAgentMessageWaiter,
} from './sub-agent-types';

/**
 * Routes peer messages between parent and child agents and decides
 * whether each inbound message arrives as a Pebble context message or a
 * framework text message.
 *
 * Pairing strategy is FIFO: when a recipient has a waiting tool call in
 * its capability state, the next inbound message is delivered as a tool
 * result; subsequent messages queue for `drain`.
 */
export class SubAgentCoordinator {
  private readonly inbox: InboxQueues = { byRecipient: new Map() };
  private readonly waiters = new Map<string, SubAgentMessageWaiter[]>();
  private readonly ctx: SubAgentCoordinatorContext;

  public constructor(ctx: SubAgentCoordinatorContext) {
    this.ctx = ctx;
  }

  /**
   * Enqueues a message for the given recipient and tries to flush it
   * into the running agent (rehydrating if necessary). Pending awaits
   * resolve first; otherwise the message goes through the waiting-pair
   * lookup before falling back to a normal submitMessage.
   */
  public async deliver(input: DeliverInput): Promise<void> {
    const queue = this.inbox.byRecipient.get(input.recipientAgentId) ?? [];
    queue.push(input.message);
    this.inbox.byRecipient.set(input.recipientAgentId, queue);
    const waiterList = this.waiters.get(input.recipientAgentId);
    const waiter = waiterList?.shift();
    if (waiter !== undefined) {
      const next = queue.shift();
      if (next !== undefined) {
        waiter(next);
      }
    }
    await this.flushTo({ recipientAgentId: input.recipientAgentId });
  }

  /**
   * Resolves the next message in the recipient's inbox; awaits one if
   * none is queued.
   */
  public async awaitNext(input: AwaitNextInput): Promise<SubAgentMessage> {
    const queue = this.inbox.byRecipient.get(input.recipientAgentId) ?? [];
    const next = queue.shift();
    if (next !== undefined) {
      return next;
    }
    return new Promise((resolve) => {
      const list = this.waiters.get(input.recipientAgentId) ?? [];
      list.push(resolve);
      this.waiters.set(input.recipientAgentId, list);
    });
  }

  /**
   * Returns and clears any unread queued messages without waiting. Used
   * by the non-blocking `read*` tools so the model can peek at inbound
   * traffic without waiting.
   */
  public drain(input: DrainInput): SubAgentMessage[] {
    const queue = this.inbox.byRecipient.get(input.recipientAgentId) ?? [];
    this.inbox.byRecipient.set(input.recipientAgentId, []);
    return queue;
  }

  private async flushTo(input: AwaitNextInput): Promise<void> {
    const queue = this.inbox.byRecipient.get(input.recipientAgentId) ?? [];
    if (queue.length === 0) {
      return;
    }
    let live: Agent;
    try {
      live = await this.ctx.agentRegistry.rehydrate(input.recipientAgentId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.ctx.logger.warn('failed to rehydrate recipient for delivery', {
        agentId: input.recipientAgentId,
        error: message,
      });
      return;
    }
    while (queue.length > 0) {
      const message = queue.shift();
      if (message === undefined) {
        break;
      }
      if (live instanceof PebbleAgent) {
        live.sendMessage([Cell.header2(message.label), ...message.content]);
        continue;
      }
      live.sendMessage([Cell.text(this.cellsToText(message.content))]);
    }
    this.inbox.byRecipient.set(input.recipientAgentId, queue);
  }

  private cellsToText(cells: DataCells): string {
    return cells
      .map((cell) => {
        if (cell.type === 'text' || cell.type === 'header1' || cell.type === 'header2') {
          return cell.content.text;
        }
        if (cell.type === 'codeBlock') {
          return cell.content.code;
        }
        if (cell.type === 'data') {
          return JSON.stringify(cell.content.value);
        }
        return '';
      })
      .join('\n');
  }
}
