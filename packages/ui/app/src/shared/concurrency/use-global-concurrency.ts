import type { ConcurrencyIntensity } from '@two-pebble/components';
import { useAgents } from '@two-pebble/realtime';
import { useMemo } from 'react';

const ACTIVE_STATUSES = new Set(['running', 'waiting']);

const LOW_THRESHOLD = 1;
const MEDIUM_THRESHOLD = 4;
const HIGH_THRESHOLD = 8;

export interface GlobalConcurrencyState {
  count: number;
  intensity: ConcurrencyIntensity;
}

/**
 * Returns global concurrency saturation for the task board chrome.
 *
 * Counts agents currently in `running` or `waiting` state — these are
 * the agents actively booked against board/pool concurrency limits.
 * Intensity is bucketed from the raw count rather than computed against
 * a configured cap; cap data lives in per-board dispatch settings and
 * is not bulk-queryable today, so a simple thresholded scale (low up
 * to 3 active, medium up to 7, high beyond) keeps the indicator
 * informative without dragging the entire dispatch-settings table into
 * every render.
 */
export function useGlobalConcurrency(): GlobalConcurrencyState {
  const agents = useAgents();
  return useMemo(() => {
    const count = agents.values().filter((agent) => ACTIVE_STATUSES.has(agent.status)).length;
    return { count, intensity: bucketIntensity(count) };
  }, [agents]);
}

function bucketIntensity(count: number): ConcurrencyIntensity {
  if (count < LOW_THRESHOLD) {
    return 'idle';
  }
  if (count < MEDIUM_THRESHOLD) {
    return 'low';
  }
  if (count < HIGH_THRESHOLD) {
    return 'medium';
  }
  return 'high';
}
