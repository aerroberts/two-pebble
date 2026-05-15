import { CircleSlash, MousePointerClick } from 'lucide-react';

export type AutomationIndicatorState = 'disabled' | 'manual' | 'scheduled';
export type AutomationIndicatorVariant = 'badge' | 'pill';

export interface AutomationIndicatorProps {
  state: AutomationIndicatorState;
  cadenceLabel?: string;
  cadenceTitle?: string;
  variant?: AutomationIndicatorVariant;
}

export function AutomationIndicator(props: AutomationIndicatorProps) {
  const variant = props.variant ?? 'badge';
  const iconSize = variant === 'badge' ? 12 : 14;

  if (props.state === 'disabled') {
    const disabledClass =
      variant === 'badge'
        ? 'inline-flex items-center opacity-40'
        : 'inline-flex items-center gap-1 text-content-muted opacity-50';
    return (
      <span className={disabledClass} title="Disabled">
        <CircleSlash size={iconSize} />
      </span>
    );
  }

  if (props.state === 'manual') {
    const manualClass =
      variant === 'badge' ? 'inline-flex items-center' : 'inline-flex items-center gap-1 text-content-muted';
    return (
      <span className={manualClass} title="Manual">
        <MousePointerClick size={iconSize} />
      </span>
    );
  }

  if (variant === 'pill') {
    return (
      <span
        className="inline-flex items-center rounded bg-content/[0.06] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-content-muted"
        title={props.cadenceTitle}
      >
        {props.cadenceLabel}
      </span>
    );
  }

  return (
    <span className="font-mono text-[10px] font-semibold" title={props.cadenceTitle}>
      {props.cadenceLabel}
    </span>
  );
}
