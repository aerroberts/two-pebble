import type { ProbeResult } from '@two-pebble/pebble';
import { STALE_AFTER_MS } from './constants';
import type { LivenessState } from './types';

export function deriveActiveState(probe: ProbeResult, now: number): LivenessState {
  if (probe.settled === 'idle') {
    return 'idle';
  }
  if (!probe.alive) {
    return 'idle';
  }
  if (probe.lastActivityAt > 0 && now - probe.lastActivityAt > STALE_AFTER_MS) {
    return 'stalled';
  }
  return 'running';
}
