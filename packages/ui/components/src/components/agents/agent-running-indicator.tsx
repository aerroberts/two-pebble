import { Icon } from '../content/icon/icon';

export type AgentRunningIndicatorStatus = 'idle' | 'running' | 'waiting' | 'offline' | 'failed';
export type AgentLivenessDisplayState = 'running' | 'stalled' | 'reconnecting' | 'idle';

export interface AgentRunningIndicatorProps {
  status: AgentRunningIndicatorStatus;
  liveness?: {
    state: AgentLivenessDisplayState;
    lastActivityAt: number;
    rehydrationAttempts?: number;
    lastError?: string;
    hint?: string;
  } | null;
}

/**
 * Bottom-of-chat status pill. Combines durable agent status (intent) with
 * the most recent liveness broadcast (actuality) so the caller can tell
 * the difference between "doing work", "stalled mid-flight", "daemon is
 * trying to reconnect after restart", and "genuinely idle". When intent
 * is not running the indicator hides itself.
 */
export function AgentRunningIndicator(props: AgentRunningIndicatorProps) {
  if (props.status !== 'running') return null;
  const liveness = props.liveness;
  const now = Date.now();
  const ageSeconds =
    liveness && liveness.lastActivityAt > 0 ? Math.max(0, Math.floor((now - liveness.lastActivityAt) / 1000)) : null;

  if (liveness?.state === 'reconnecting') {
    return (
      <div className="flex items-center gap-2 rounded-sm bg-surface px-3 py-2 text-content-subtle text-sm">
        <Icon name="loader-circle" className="size-4 animate-spin" color="text-accent" />
        <span>
          Reconnecting to agent
          {liveness.rehydrationAttempts ? ` (attempt ${liveness.rehydrationAttempts})` : null}
          {liveness.lastError ? ` — last error: ${liveness.lastError}` : null}
        </span>
      </div>
    );
  }

  if (liveness?.state === 'stalled') {
    return (
      <div className="flex items-center gap-2 rounded-sm bg-surface px-3 py-2 text-content-subtle text-sm">
        <Icon name="triangle-alert" className="size-4" color="text-warning" />
        <span>
          Stalled — no activity for {ageSeconds ?? '?'}s{liveness.hint ? ` (${liveness.hint})` : null}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-sm bg-surface px-3 py-2 text-content-subtle text-sm">
      <Icon name="loader-circle" className="size-4 animate-spin" color="text-accent" />
      <span>
        Agent is working
        {ageSeconds !== null ? ` — last activity ${ageSeconds}s ago` : '…'}
      </span>
    </div>
  );
}
