import type { AgentCapability } from '../agent';
import type { PebbleJsonValue } from '../types';
import { CapabilityRegistry } from './capability-registry';

export const capabilityRegistry = new CapabilityRegistry();

export function buildCapability(id: string): AgentCapability<PebbleJsonValue> {
  return capabilityRegistry.newCapability(id);
}
