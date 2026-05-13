/**
 * In-memory liveness snapshot for a single agent. Broadcast by the daemon
 * roughly every 2s while the daemon believes the agent should be active.
 * Never persisted — clients reconcile by trusting the most recent
 * broadcast for the active `daemonBootId`. When the boot id changes, the
 * client clears its cache because the world reset.
 */
export interface AgentLivenessEvent {
  name: 'agentLiveness';
  payload: {
    agentId: string;
    daemonBootId: string;
    state: 'running' | 'stalled' | 'reconnecting' | 'idle';
    lastActivityAt: number;
    rehydrationAttempts?: number;
    lastError?: string;
    hint?: string;
  };
}
