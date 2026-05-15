import { Icon } from '../content/icon/icon';
import { IconButton } from '../input/icon-button/icon-button';

export type AgentRunningIndicatorStatus = 'idle' | 'running' | 'waiting' | 'interrupted' | 'offline' | 'failed';
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
  /** When provided, renders an inline ghost stop button at the end of the status line. */
  onStop?: () => void;
  /** Disables the stop button while a stop is in progress. */
  stopping?: boolean;
}

/**
 * Bottom-of-chat status pill. Running is live daemon state; waiting and
 * interrupted are durable lifecycle states that should not use spinner
 * language.
 *
 * When `onStop` is provided, an inline ghost stop button appears at the end
 * of the "Agent is working" status line. Clicking it immediately stops the
 * agent with no confirmation modal.
 */
export function AgentRunningIndicator(props: AgentRunningIndicatorProps) {
  if (props.status === 'waiting') {
    return (
      <div className="flex items-center gap-2 rounded-md bg-surface px-3 py-2 text-content-subtle text-sm">
        <Icon name="clock" className="size-4" color="text-content-muted" />
        <span>Agent is waiting</span>
      </div>
    );
  }

  if (props.status === 'interrupted') {
    return (
      <div className="flex items-center gap-2 rounded-md bg-surface px-3 py-2 text-content-subtle text-sm">
        <Icon name="triangle-alert" className="size-4" color="text-warning" />
        <span>Agent was interrupted</span>
      </div>
    );
  }

  if (props.status !== 'running') {
    return null;
  }
  const liveness = props.liveness;
  const now = Date.now();
  const ageSeconds =
    liveness && liveness.lastActivityAt > 0 ? Math.max(0, Math.floor((now - liveness.lastActivityAt) / 1000)) : null;

  if (liveness?.state === 'reconnecting') {
    return (
      <div className="flex items-center gap-2 rounded-md bg-surface px-3 py-2 text-content-subtle text-sm">
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
      <div className="flex items-center gap-2 rounded-md bg-surface px-3 py-2 text-content-subtle text-sm">
        <Icon name="triangle-alert" className="size-4" color="text-warning" />
        <span>
          Stalled — no activity for {ageSeconds ?? '?'}s{liveness.hint ? ` (${liveness.hint})` : null}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md bg-surface px-3 py-2 text-content-subtle text-sm">
      <Icon name="loader-circle" className="size-4 animate-spin" color="text-accent" />
      <span>
        Agent is working
        {ageSeconds !== null ? ` — last activity ${ageSeconds}s ago` : '…'}
      </span>
      {props.onStop ? (
        <IconButton
          aria-label="Stop agent"
          className="ml-auto"
          disabled={props.stopping}
          icon="square"
          title={props.stopping ? 'Stopping…' : 'Stop agent'}
          variant="secondary"
          onClick={props.onStop}
        />
      ) : null}
    </div>
  );
}
