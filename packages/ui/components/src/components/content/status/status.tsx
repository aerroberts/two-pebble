import type { ReactNode } from 'react';

import { Icon } from '../icon/icon';

export type StatusState = 'idle' | 'not-started' | 'in-progress' | 'failed' | 'success' | 'connected' | 'disconnected';
export type StatusVariant = 'default' | 'icon' | 'pill';

interface StatusStateConfig {
  label: string;
  iconName?: string;
  dot?: boolean;
  iconClass: string;
  animationClass?: string;
}

const statusStateConfig: Record<StatusState, StatusStateConfig> = {
  idle: {
    label: 'Idle',
    iconName: 'circle',
    iconClass: 'text-content-subtle',
  },
  'not-started': {
    label: 'Not Started',
    iconName: 'clock',
    iconClass: 'text-content-muted',
  },
  'in-progress': {
    label: 'In Progress',
    iconName: 'loader-circle',
    iconClass: 'text-accent',
    animationClass: 'animate-spin',
  },
  failed: {
    label: 'Failed',
    iconName: 'circle-x',
    iconClass: 'text-danger',
  },
  success: {
    label: 'Success',
    iconName: 'circle-check',
    iconClass: 'text-accent',
  },
  connected: {
    label: 'Connected',
    iconName: 'circle-check',
    iconClass: 'text-accent',
  },
  disconnected: {
    label: 'Disconnected',
    iconName: 'circle-slash',
    iconClass: 'text-content-muted',
  },
};

export interface StatusProps {
  state: StatusState;
  label?: ReactNode;
  variant?: StatusVariant;
}

export function Status(props: StatusProps) {
  const icon = <StatusIndicator state={props.state} />;

  if (props.variant === 'icon' && props.label === undefined) {
    return (
      <span className="inline-flex items-center text-content" role="img" aria-label={getStatusLabel(props.state)}>
        {icon}
      </span>
    );
  }

  const label = props.label ?? getStatusLabel(props.state);

  if (props.variant === 'pill') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-hover px-2 py-0.5 text-xs text-content">
        <StatusIndicator state={props.state} />
        <span>{label}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-sm text-content">
      {icon}
      <span>{label}</span>
    </span>
  );
}

export function getStatusLabel(state: StatusState) {
  return statusStateConfig[state].label;
}

function StatusIndicator(props: { state: StatusState }) {
  const stateConfig = statusStateConfig[props.state];

  if (stateConfig.dot) {
    const isPing = props.state === 'connected';

    return (
      <span className="relative inline-flex h-2 w-2">
        {isPing ? (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-30 ${stateConfig.iconClass}`}
          />
        ) : null}
        <span className={`relative inline-flex h-2 w-2 rounded-full opacity-70 ${stateConfig.iconClass}`} />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center">
      <Icon
        name={stateConfig.iconName ?? 'circle'}
        color={stateConfig.iconClass}
        className={stateConfig.animationClass}
      />
    </span>
  );
}
