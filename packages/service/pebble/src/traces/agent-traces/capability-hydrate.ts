import type { DataCells } from '../../thread';

export interface PebbleAgentCapabilityHydrateTrace {
  type: 'capability-hydrate';
  data: {
    capabilityId: string;
    name: string;
    description: string;
    tools: {
      description: string;
      example: DataCells;
      name: string;
      type: 'cli' | 'framework' | 'native';
    }[];
  };
}
