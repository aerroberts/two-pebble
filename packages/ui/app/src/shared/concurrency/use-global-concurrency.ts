import { useAgents } from '@two-pebble/realtime';
import { useMemo } from 'react';

const ACTIVE_STATUSES = new Set(['running', 'waiting']);

export interface GlobalConcurrencyState {
  count: number;
}

/**
 * Counts agents currently in `running` or `waiting` state across the realtime
 * agent registry. Drives the "X active" badge on the Tasks sidebar option in
 * `MainAppShell`. Lives in `shared/` rather than colocated with the sidebar
 * so other surfaces can reuse the count without re-implementing the filter.
 */
export function useGlobalConcurrency(): GlobalConcurrencyState {
  const agents = useAgents();
  return useMemo(() => {
    const count = agents.values().filter((agent) => ACTIVE_STATUSES.has(agent.status)).length;
    return { count };
  }, [agents]);
}
