'use client';

import { useRealtimeStore } from '../../integrations/hooks/use-realtime-store.hook';
import type { AgentLivenessHookResult } from '../types';

/**
 * Returns the most recent liveness snapshot for a single agent, or null
 * if the daemon has not broadcast a liveness event for that agent yet.
 */
export function useAgentLiveness(agentId: string): AgentLivenessHookResult {
  return useRealtimeStore((state) => state.agentLiveness.getItem(agentId)?.value ?? null);
}
