import type {
  AgentSignal,
  RegisterSignalInput,
  ResolveSignalInput,
  SendSignalInput,
  SignalOperations,
} from '../../bridge';
import type { PebbleJsonValue } from '../../types';
import type { SignalSnapshotRecord } from './pebble-agent-signals.test-types';

/**
 * In-memory signal operations used by the PebbleAgent signal test.
 */
export class MemorySignalOperations implements SignalOperations {
  private readonly agentId: string;
  private readonly signals = new Map<string, AgentSignal>();

  public constructor(agentId: string) {
    this.agentId = agentId;
  }

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

  public async send(_input: SendSignalInput): Promise<void> {}

  public async resolve(_input: ResolveSignalInput): Promise<void> {}

  public async snapshot(): Promise<SignalSnapshotRecord> {
    const signals = Array.from(this.signals.values());
    return {
      openAwaited: signals.filter((signal) => signal.status === 'open'),
      received: signals.filter((signal) => signal.status === 'received'),
    };
  }

  public async markResolved(input: { id: string }): Promise<void> {
    for (const signal of this.signals.values()) {
      if (signal.id === input.id) {
        signal.status = 'resolved';
      }
    }
  }

  public receive(signalId: string, data: PebbleJsonValue): void {
    const signal = this.signals.get(signalId);
    if (signal !== undefined) {
      signal.data = data;
      signal.status = 'received';
    }
  }

  public openSignalIds(): string[] {
    return Array.from(this.signals.values())
      .filter((signal) => signal.status === 'open')
      .map((signal) => signal.signalId);
  }

  public resolvedSignalIds(): string[] {
    return Array.from(this.signals.values())
      .filter((signal) => signal.status === 'resolved')
      .map((signal) => signal.signalId);
  }
}
