import type { AgentTool } from '../agent';

/**
 * The handle returned by `useState`. Reads via `value`; writes through
 * `set`, which both updates the slot and emits a state-snapshot trace.
 * The slot's runtime contract is that values must JSON-roundtrip; the
 * abstract class casts at the trace boundary so subclasses can use
 * domain-specific types (interfaces, branded ids, etc.) at the call site.
 */
export interface CapabilityState<T> {
  readonly value: T;
  set(next: T): void;
}

export interface RegisterHookResult {
  system: string;
  tools: AgentTool[];
}
