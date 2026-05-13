import type { PebbleAgent } from '../agent/agents/pebble-agent';
import { AgentExitHook } from '../agent/hooks/agent-exit-hook';
import { EarlyExit } from '../agent/hooks/early-exit';
import type { AgentSignal, RegisterSignalInput, ResolveSignalInput, SendSignalInput } from '../agent/signal-runner';
import type { PebbleJsonValue } from '../types';
import type { CapabilityState, RegisterHookResult } from './agent-capability.types';
import { getCapabilityRunners } from './runners';

/**
 * Base class for Pebble runtime capabilities.
 * Capabilities own model-facing tools, per-capability state slots, and
 * lifecycle hooks that plug into PebbleAgent turns.
 */
export abstract class AgentCapability<TConfig = PebbleJsonValue> {
  // The id for the capability, two capabilities with the same id are not allowed
  public abstract readonly id: string;

  // The description for the capability, this is used to describe the capability to the user (not given to the model)
  public abstract readonly description: string;

  // We own direct reference to the agent
  protected agent!: PebbleAgent;

  // Capabiltiies need serializable state stores so we can reinitialize them as needed
  private readonly state = new Map<string, PebbleJsonValue>();

  /**
   * Binds the capability to the owning agent.
   * Called before registration hooks so capability implementations can
   * access agent services while building tools or context.
   */
  public attach(agent: PebbleAgent): void {
    this.agent = agent;
  }

  /**
   * Replays durable state into this capability.
   * Used on rehydrate before hooks run so slots expose the latest
   * persisted values.
   */
  public restoreState(state: Map<string, PebbleJsonValue>): void {
    for (const [name, value] of state) {
      this.state.set(name, value);
    }
  }

  /**
   * Restores persisted state slots.
   * Kept as the slot-oriented public name while delegating to the same
   * state replay mechanism.
   */
  public restoreSlots(state: Map<string, PebbleJsonValue>): void {
    this.restoreState(state);
  }

  /**
   * Initializes a fresh capability from registry config.
   * Rehydrated capabilities skip this path and receive persisted slot
   * state instead.
   */
  public initialize(_config: TConfig): void {}

  /**
   * Runs after the capability is freshly registered, and again in re-hydration to rebuild tools, though some tools might be discarded
   */
  public hookOnRegister(_config: TConfig): RegisterHookResult {
    return { tools: [] };
  }

  /**
   * Runs after the capability is removed. Override this to clean up
   * external state or dependent tools.
   */
  public hookOnRemove(_reason: string): void {}

  /**
   * Runs before every model turn. Override this to append context cells,
   * adapt instructions, or otherwise prepare the thread for the next call.
   */
  public hookBeforeAgentTurn(): void {}

  /**
   * Receives durable signal data addressed to this capability.
   * Override when a capability participates in parent/child or external
   * signal flows.
   */
  public hookOnSignal(_signal: AgentSignal): void {}

  /**
   * Decides whether the agent may exit. Returning a denial forces another
   * agentic step with the supplied reason.
   */
  public hookOnAgentExit() {
    return AgentExitHook.permitExit();
  }

  /**
   * Decides whether this capability should be removed early. Supports
   * short-lived capabilities that finish themselves.
   */
  public hookOnEarlyExit() {
    return EarlyExit.notPossible('Default: capability may have actions, default to no early exit');
  }

  /**
   * Declares a named state slot with a default value. Returns a handle
   * whose `set` method updates the slot AND emits a `state-snapshot` trace
   * so the value is durable across daemon restarts. Slot names must be
   * unique per capability instance.
   */
  protected useState<T>(name: string, initial: T): CapabilityState<T> {
    if (this.state.has(name)) {
      throw new Error(`Capability "${this.id}" already declared a state named "${name}".`);
    }

    // Getter and setter for the state
    const getter = () => this.state.get(name) as T;
    const setter = (next: T) => {
      this.state.set(name, next as PebbleJsonValue);
      if (this.agent !== undefined) {
        this.agent.emit('trace', {
          type: 'state-snapshot',
          data: {
            capabilityId: this.id,
            name,
            value: next as PebbleJsonValue,
          },
        });
      }
    };
    this.state.set(name, initial as PebbleJsonValue);

    return {
      get value(): T {
        return getter();
      },
      set: (next: T) => {
        setter(next);
      },
    };
  }

  protected async registerSignal(input: Omit<RegisterSignalInput, 'capabilityId'>): Promise<string> {
    const signalId = await this.requireSignalRunner().register({ ...input, capabilityId: this.id });
    this.agent.emit('trace', {
      type: 'signal-registered',
      data: {
        capabilityId: this.id,
        description: input.description,
        kind: 'awaited',
        name: input.name,
        signalId,
        status: 'open',
      },
    });
    return signalId;
  }

  protected async sendSignal(input: SendSignalInput): Promise<void> {
    await this.requireSignalRunner().send(input);
  }

  protected async resolveSignal(input: ResolveSignalInput): Promise<void> {
    await this.requireSignalRunner().resolve(input);
  }

  private requireSignalRunner() {
    const runner = getCapabilityRunners(this.agent).signal;
    if (runner === undefined) {
      throw new Error('signal runner is not installed.');
    }
    return runner;
  }
}
