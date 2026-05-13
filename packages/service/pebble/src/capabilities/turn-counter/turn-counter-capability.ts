import { AgentCapability } from '../agent-capability';
import type { TurnCounterCapabilityConfig } from './types';

/**
 * Minimal capability used by the abstract-class tests. Holds one numeric
 * slot called `count` so tests can exercise initialize, useState, and
 * restoreSlots without involving the rest of the agent stack.
 */
export class TurnCounterCapability extends AgentCapability<TurnCounterCapabilityConfig> {
  public readonly id = 'turn-counter';
  public readonly description = 'Counts turns.';
  private readonly countSlot = this.useState<number>('count', 0);

  /**
   * Seeds the counter from `config.start` when launched fresh. Skipped on
   * rehydrate; the durable value comes back through restoreSlots instead.
   */
  public override initialize(config: TurnCounterCapabilityConfig): void {
    if (typeof config.start === 'number') this.countSlot.set(config.start);
  }

  /**
   * Returns the current turn count from the durable state slot.
   * Useful for tests that assert restored values after a simulated rehydrate.
   */
  public read(): number {
    return this.countSlot.value;
  }

  /**
   * Increments the turn counter by one and emits a new state-snapshot trace
   * through the durable slot, demonstrating the slot.set mutation path.
   */
  public bump(): void {
    this.countSlot.set(this.countSlot.value + 1);
  }
}
