import type { PebbleAgent } from '../agent/agents/pebble-agent';
import { AgentExitHook } from '../agent/hooks/agent-exit-hook';
import { EarlyExit } from '../agent/hooks/early-exit';
import type { PebbleJsonValue } from '../types';
import type { CapabilityState, RegisterHookResult } from './agent-capability.types';

/**
 * Groups tools, instructions, and lifecycle hooks. Capabilities are the unit
 * an agent can register or remove. Subclasses declare their own state slots
 * with `useState`; on rehydrate the agent replays the latest snapshot per
 * slot through `restoreSlots` so durable state survives a daemon restart.
 *
 * The optional `TConfig` parameter narrows the shape `initialize` expects
 * so subclasses can take a typed config object instead of `PebbleJsonValue`.
 * The launch path passes a parsed JSON record sourced from the registry
 * row; the runtime contract is "config must JSON-roundtrip", same as state.
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
   * Binds this capability to its owning agent. The agent calls this once
   * before either initialize (fresh) or restoreSlots (rehydrate) runs.
   */
  public attach(agent: PebbleAgent): void {
    this.agent = agent;
  }

  /**
   * Replays restored slots over the capability's declared defaults.
   */
  public restoreState(state: Map<string, PebbleJsonValue>): void {
    for (const [name, value] of state) {
      this.state.set(name, value);
    }
  }

  public restoreSlots(state: Map<string, PebbleJsonValue>): void {
    this.restoreState(state);
  }

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
}
