/**
 * Capability spec persisted in the registry's `capabilities` JSON column.
 * Mirrors the runtime shape `register-pebble-capabilities` parses on launch.
 */
export interface CapabilitySpec {
  id: string;
  config: CapabilityConfigValue;
}

export type CapabilityConfigValue = boolean | null | number | string | CapabilityConfigValue[] | CapabilityConfigRecord;

export interface CapabilityConfigRecord {
  [key: string]: CapabilityConfigValue | undefined;
}

export interface SubAgentReferenceInput extends CapabilityConfigRecord {
  name: string;
  description: string;
  agentRegistryId: string;
}

export interface SubAgentCapabilityConfig extends CapabilityConfigRecord {
  agents: SubAgentReferenceInput[];
}

export interface TaskBoardAccessConfig extends CapabilityConfigRecord {
  boardId: string;
}
