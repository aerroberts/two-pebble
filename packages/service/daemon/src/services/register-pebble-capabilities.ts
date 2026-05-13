import type { Logger } from '@two-pebble/logger';
import type { Agent, PebbleJsonValue } from '@two-pebble/pebble';
import { PebbleAgent } from '@two-pebble/pebble';
import { buildCapability } from '@two-pebble/pebble/capabilities';

export type CapabilityRehydrateSlots = Map<string, Map<string, PebbleJsonValue>>;

export interface CapabilitySpec {
  id: string;
  config: PebbleJsonValue;
}

interface FreshAttachInput {
  agent: Agent;
  capabilities: CapabilitySpec[];
  logger: Logger;
}

interface RehydrateAttachInput {
  agent: Agent;
  capabilities: CapabilitySpec[];
  logger: Logger;
  slots: CapabilityRehydrateSlots;
}

/**
 * Resolves the capability spec list off the registry into runtime capability
 * instances and registers them on a freshly-built Pebble agent. Framework
 * agents are skipped — they don't have Pebble capabilities. Errors per
 * capability are logged but don't abort the launch; the agent runs without
 * the failing capability rather than crashing the daemon.
 */
export function attachFreshPebbleCapabilities(input: FreshAttachInput): void {
  if (!(input.agent instanceof PebbleAgent)) {
    return;
  }
  for (const spec of input.capabilities) {
    try {
      const capability = buildCapability(spec.id);
      input.agent.registerCapability(capability, spec.config);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      input.logger.warn('capability registration failed', { capabilityId: spec.id, error: message });
    }
  }
}

/**
 * Same as the fresh variant but uses the per-capability slot snapshots
 * captured on the previous run. The capability's `initialize(config)` does
 * not run; restored slots fully describe the durable state.
 */
export function attachRehydratedPebbleCapabilities(input: RehydrateAttachInput): void {
  if (!(input.agent instanceof PebbleAgent)) {
    return;
  }
  for (const spec of input.capabilities) {
    try {
      const capability = buildCapability(spec.id);
      const restoredSlots = input.slots.get(spec.id) ?? new Map<string, PebbleJsonValue>();
      input.agent.hydrateCapability(capability, spec.config, restoredSlots);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      input.logger.warn('capability rehydrate failed', { capabilityId: spec.id, error: message });
    }
  }
}

/**
 * Parses a registry's `capabilities` JSON column into runtime specs. Bad
 * shapes are dropped with a warning so a malformed registry row can't
 * crash the launch path.
 */
export function parseCapabilitySpecs(serialized: string, logger: Logger): CapabilitySpec[] {
  let parsed: PebbleJsonValue;
  try {
    parsed = JSON.parse(serialized) as PebbleJsonValue;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn('capability list parse failed', { error: message });
    return [];
  }
  if (!Array.isArray(parsed)) {
    return [];
  }
  const specs: CapabilitySpec[] = [];
  for (const entry of parsed) {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      continue;
    }
    const record = entry as Record<string, PebbleJsonValue | undefined>;
    if (typeof record.id !== 'string') {
      continue;
    }
    specs.push({ id: record.id, config: record.config ?? {} });
  }
  return specs;
}
