import type { DataCells } from '../../thread';

export interface PebbleAgentCapabilityRegisterTrace {
  type: 'capability-register';
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
