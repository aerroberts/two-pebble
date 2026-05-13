import type { DataCells } from '../../thread';

export interface PebbleAgentCapabilityDeregisterTrace {
  type: 'capability-deregister';
  data: {
    capabilityId: string;
    reason: DataCells;
    toolDeregistrations: {
      name: string;
      type: 'cli' | 'framework' | 'native';
    }[];
  };
}
