import type { DataCells } from './cells';
import { serializeConversationCells } from './serialize';
import type {
  ConversationThreadCell,
  ConversationThreadCellListener,
  ConversationThreadInput,
  ConversationThreadPushInput,
} from './types';

/**
 * Owns an ordered conversation cell list.
 * Role-specific helpers append cells and provider turns serialize from it.
 */
export class ConversationThread {
  public readonly cells: ConversationThreadCell[];
  public readonly threadId: string;
  public nextCellOrderId = 0;
  private readonly cellListeners: ConversationThreadCellListener[] = [];

  /**
   * Creates a thread from explicit durable identity and cells.
   * Callers own id generation so browser and server runtimes can choose safely.
   * Existing cells are used as the starting append-only history.
   */
  public constructor(input: ConversationThreadInput) {
    this.threadId = input.threadId ?? `thread-${crypto.randomUUID()}`;
    this.cells = input.cells ?? [];
    this.nextCellOrderId = this.cells.reduce((max, cell) => Math.max(max, cell.orderId), 0);
  }

  public get cursor(): string {
    return `${this.threadId}/${this.nextCellOrderId}`;
  }

  /**
   * Returns the last assigned append order.
   * Empty threads report -1 so callers can skip synchronization.
   * The value advances only through push helpers.
   */
  public get lastCellOrderId(): number {
    return this.nextCellOrderId - 1;
  }

  /**
   * Reads cells appended after a saved cursor.
   * Callers provide a cursor produced by this same thread.
   * A mismatched thread id throws instead of mixing histories.
   */
  public readFromCursor(cursor: string): ConversationThreadCell[] {
    const [threadId, orderId] = cursor.split('/');
    if (threadId !== this.threadId) {
      throw new Error(`Thread ID mismatch: ${threadId} !== ${this.threadId}`);
    }
    return this.cells.filter((cell) => cell.orderId > parseInt(orderId ?? '0', 10));
  }

  /**
   * Observes cells appended through this thread's push helpers.
   * Existing cells supplied at construction time are not replayed.
   */
  public onCell(listener: ConversationThreadCellListener) {
    this.cellListeners.push(listener);
    return () => {
      const index = this.cellListeners.indexOf(listener);
      if (index >= 0) {
        this.cellListeners.splice(index, 1);
      }
    };
  }

  /**
   * Appends user-owned cells to the thread.
   * Events can pass multiple cells through the same role.
   */
  public pushUser(label: string, ...input: DataCells) {
    return this.push({ cells: input, label, role: 'user' });
  }

  /**
   * Appends assistant-owned cells to the thread.
   * The returned cells are cloned away from internal state.
   */
  public pushAssistant(label: string, ...input: DataCells) {
    return this.push({ cells: input, label, role: 'assistant' });
  }

  /**
   * Appends system-owned cells to the thread.
   * The returned cells are cloned away from internal state.
   */
  public pushSystem(label: string, ...input: DataCells) {
    return this.push({ cells: input, label, role: 'system' });
  }

  /**
   * Appends agent-owned cells as assistant output.
   * Agents share the assistant role in provider serialization.
   */
  public pushCache(label: string, ...input: DataCells) {
    return this.push({ cells: input, label, role: 'cache' });
  }

  private push(input: ConversationThreadPushInput) {
    const cell = {
      orderId: ++this.nextCellOrderId,
      cells: input.cells,
      label: input.label,
      role: input.role,
    };
    this.cells.push(cell);
    for (const listener of this.cellListeners) {
      listener(cell);
    }
  }

  /**
   * Serializes adjacent cells into provider turns.
   * The thread remains unchanged after serialization.
   * Providers receive the role-grouped shape they expect.
   */
  public serialize() {
    return serializeConversationCells(this.cells);
  }
}
