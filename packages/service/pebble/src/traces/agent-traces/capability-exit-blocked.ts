import type { CellContent, DataCells } from '../../thread';

export interface PebbleAgentCapabilityExitBlockedTrace {
  type: 'capability-exit-blocked';
  data: {
    capabilityId: string;
    reason: DataCells;
  };
}
