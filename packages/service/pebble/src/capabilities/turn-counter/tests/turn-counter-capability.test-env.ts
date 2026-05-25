import type { CapabilityStateSnapshot } from '../../../agent/types';
import { TurnCounterCapability } from '../turn-counter-capability';

interface CapabilityFixture {
  capability: TurnCounterCapability;
  snapshots: CapabilityStateSnapshot[];
}

interface SnapshotRecorder {
  emit(event: string, trace: CapabilityTraceSnapshot): void;
}

interface CapabilityTraceSnapshot {
  type: string;
  data: CapabilityStateSnapshot;
}

interface RecordingAgent {
  recorder: SnapshotRecorder;
  snapshots: CapabilityStateSnapshot[];
}

interface TurnCounterFreshConfig {
  start: number;
}

interface TurnCounterRehydrateSlots {
  count: number;
}

export function recordingAgent(): RecordingAgent {
  const snapshots: CapabilityStateSnapshot[] = [];
  const recorder: SnapshotRecorder = {
    emit: (event: string, trace: CapabilityTraceSnapshot) => {
      if (event === 'trace' && trace.type === 'state-snapshot') {
        snapshots.push(trace.data);
      }
    },
  };
  return { recorder, snapshots };
}

export function buildTurnCounterCapabilityFresh(config: TurnCounterFreshConfig): CapabilityFixture {
  const { recorder, snapshots } = recordingAgent();
  const capability = new TurnCounterCapability();
  capability.attach(recorder as never);
  capability.initialize(config);
  return { capability, snapshots };
}

export function buildTurnCounterCapabilityRehydrated(slots: TurnCounterRehydrateSlots): CapabilityFixture {
  const { recorder, snapshots } = recordingAgent();
  const capability = new TurnCounterCapability();
  capability.attach(recorder as never);
  capability.restoreSlots(new Map([['count', slots.count]]));
  return { capability, snapshots };
}
