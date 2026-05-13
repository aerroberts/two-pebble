import type { AgentSignalRecord, Datastore } from '@two-pebble/datastore';
import type {
  AgentSignal,
  RegisterSignalInput,
  ResolveSignalInput,
  SendSignalInput,
  SignalRunner,
  SignalSnapshot,
} from '@two-pebble/pebble';
import type { DaemonSignalRunnerContext, WakeAgentFromSignal } from './daemon-signal-runner-types';

/**
 * Persists Pebble capability signals through the daemon datastore.
 * The runner owns durable register/send/resolve operations and wakes
 * target agents when a signal state change may unblock their execution.
 */
export class DaemonSignalRunner implements SignalRunner {
  private readonly agentId: string;
  private readonly datastore: Datastore;
  private readonly wake: WakeAgentFromSignal;

  public constructor(input: DaemonSignalRunnerContext) {
    this.agentId = input.agentId;
    this.datastore = input.datastore;
    this.wake = input.wake;
  }

  /**
   * Records an awaited signal for this agent.
   * The returned id is stable for later sends or resolves.
   * Callers may provide an id when restoring a known signal contract.
   */
  public async register(input: RegisterSignalInput): Promise<string> {
    const signalId = input.signalId ?? crypto.randomUUID();
    await this.datastore.agent.signals.register({
      agentId: this.agentId,
      capabilityId: input.capabilityId,
      description: input.description,
      name: input.name,
      signalId,
    });
    return signalId;
  }

  /**
   * Sends a push signal to another agent.
   * The target is woken after persistence so queued messages can be
   * consumed without waiting for the periodic liveness reconciler.
   */
  public async send(input: SendSignalInput): Promise<void> {
    await this.datastore.agent.signals.sendPush({
      agentId: input.agentId,
      capabilityId: input.capabilityId,
      data: input.data,
      description: input.description,
      name: input.name,
      signalId: input.signalId ?? crypto.randomUUID(),
    });
    await this.wake(input.agentId);
  }

  /**
   * Marks a signal resolved through the normal capability path.
   * The affected agent is woken because all awaited signals may now
   * be satisfied and ready to resume.
   */
  public async resolve(input: ResolveSignalInput): Promise<void> {
    await this.datastore.agent.signals.resolve(input);
    await this.wake(input.agentId);
  }

  /**
   * Reads the current signal snapshot for an agent.
   * Pebble uses this to decide whether execution should wait or resume
   * when a capability flow reaches a signal boundary.
   */
  public async snapshot(agentId: string): Promise<SignalSnapshot> {
    const [openAwaited, received] = await Promise.all([
      this.datastore.agent.signals.listOpenForAgent({ agentId }),
      this.datastore.agent.signals.listReceivedForAgent({ agentId }),
    ]);
    return {
      openAwaited: openAwaited.items.map((record) => this.toAgentSignal(record)),
      received: received.items.map((record) => this.toAgentSignal(record)),
    };
  }

  /**
   * Marks a datastore signal row resolved by id.
   * This is used for lower-level cleanup paths where the caller already
   * has the durable signal row identifier.
   */
  public async markResolved(id: string): Promise<void> {
    await this.datastore.agent.signals.markResolved({ id });
  }

  private toAgentSignal(record: AgentSignalRecord): AgentSignal {
    return {
      agentId: record.agentId,
      capabilityId: record.capabilityId,
      data: record.data,
      description: record.description,
      id: record.id,
      kind: record.kind,
      name: record.name,
      signalId: record.signalId,
      status: record.status,
    };
  }
}
