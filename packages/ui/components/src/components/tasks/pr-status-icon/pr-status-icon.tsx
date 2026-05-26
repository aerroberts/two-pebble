import { Icon } from '../../content/icon/icon';

export type PrStatusIconState = 'mergeable' | 'unmergeable' | 'merged' | 'closed';

export interface PrStatusIconProps {
  state: PrStatusIconState;
  checksInFlight?: boolean;
  className?: string;
}

const CONFIG: Record<PrStatusIconState, { icon: string; color: string }> = {
  mergeable: { icon: 'check', color: 'text-success' },
  unmergeable: { icon: 'triangle-alert', color: 'text-danger' },
  merged: { icon: 'git-merge', color: 'text-accent' },
  closed: { icon: 'x', color: 'text-content-muted' },
};

export function PrStatusIcon(props: PrStatusIconProps) {
  const config =
    props.checksInFlight && props.state === 'mergeable'
      ? { icon: 'circle-dot', color: 'text-warning' }
      : CONFIG[props.state];
  return (
    <span
      title={`PR ${props.state}`}
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${config.color} ${props.className ?? ''}`}
    >
      <Icon name={config.icon} color="text-current" className="size-3.5" />
    </span>
  );
}
