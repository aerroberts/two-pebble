import type { AgentCapability } from '../agent';
import type { PebbleJsonValue } from '../types';

export type CapabilityFactory = () => AgentCapability<PebbleJsonValue>;
