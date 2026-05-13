import type { PebbleJsonValue } from '../../types';
import type {
  AgentSignal,
  RegisterSignalInput,
  ResolveSignalInput,
  SendSignalInput,
  SignalRunner,
} from '../signal-runner';
import type { SignalSnapshotRecord } from './pebble-agent-signals.test-types';

/**
 * In-memory signal runner used by the PebbleAgent signal test.
 * It models the durable signal store closely enough to cover open,
 * received, and resolved snapshots without touching the daemon datastore.
 */
export class MemorySignalRunner implements SignalRunner {
  private readonly agentId: string;
  private readonly signals = new Map<string, AgentSignal>();

  public constructor(agentId: string) {
    this.agentId = agentId;
  }

  /**
   * Records an awaited signal in memory.
   * The row id mirrors the daemon datastore id shape.
   * Tests use the signal id to flip the row to received later.
   */
  public async register(input: RegisterSignalInput): Promise<string> {
    const signalId = input.signalId ?? crypto.randomUUID();
    this.signals.set(signalId, {
      agentId: this.agentId,
      capabilityId: input.capabilityId,
      data: {},
      description: input.description,
      id: `row-${signalId}`,
      kind: 'awaited',
      name: input.name,
      signalId,
      status: 'open',
    });
    return signalId;
  }

  /**
   * Implements the SignalRunner send contract for this fixture.
   * The test drives received signals directly through `receive`, so send
   * intentionally has no side effects.
   */
  public async send(_input: SendSignalInput): Promise<void> {}

  /**
   * Implements the SignalRunner resolve contract for this fixture.
   * Resolution is asserted through markResolved because PebbleAgent uses
   * durable signal row ids after consuming received signals.
   */
  public async resolve(_input: ResolveSignalInput): Promise<void> {}

  /**
   * Returns the current open and received signal rows.
   * This mirrors the daemon runner snapshot contract.
   * The agent uses it to decide whether to wait or resume.
   */
  public async snapshot(): Promise<SignalSnapshotRecord> {
    const signals = Array.from(this.signals.values());
    return {
      openAwaited: signals.filter((signal) => signal.status === 'open'),
      received: signals.filter((signal) => signal.status === 'received'),
    };
  }

  /**
   * Marks the matching signal row resolved.
   * The agent calls this after delivering received signal data to the
   * capability hook.
   */
  public async markResolved(id: string): Promise<void> {
    for (const signal of this.signals.values()) {
      if (signal.id === id) {
        signal.status = 'resolved';
      }
    }
  }

  /**
   * Injects an inbound signal into the memory runner.
   * Tests call this to simulate another agent or daemon path sending
   * data to the waiting agent.
   */
  public receive(signalId: string, data: PebbleJsonValue): void {
    const signal = this.signals.get(signalId);
    if (signal !== undefined) {
      signal.data = data;
      signal.status = 'received';
    }
  }

  /**
   * Lists currently-open signal ids.
   * Kept narrow for test assertions that only care about the public
   * signal identifier.
   */
  public openSignalIds(): string[] {
    return Array.from(this.signals.values())
      .filter((signal) => signal.status === 'open')
      .map((signal) => signal.signalId);
  }

  /**
   * Lists resolved signal ids.
   * Used to assert that PebbleAgent marked the received signal consumed
   * after resuming.
   */
  public resolvedSignalIds(): string[] {
    return Array.from(this.signals.values())
      .filter((signal) => signal.status === 'resolved')
      .map((signal) => signal.signalId);
  }
}
