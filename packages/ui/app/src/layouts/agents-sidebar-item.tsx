import { Icon } from '@two-pebble/components';
import type { AgentRecord, AgentStatus } from '@two-pebble/realtime';
import type { MouseEvent, ReactNode } from 'react';

interface AgentSidebarItemProps {
  active: boolean;
  agent: AgentRecord;
  onSelect: () => void;
  onStop?: () => void;
  onArchive?: () => void;
}

interface IconConfig {
  defaultIcon: ReactNode;
  hoverIcon: ReactNode | null;
  hoverLabel: string | null;
  hoverAction: (() => void) | null;
}

function iconConfigForStatus(status: AgentStatus, onStop?: () => void, onArchive?: () => void): IconConfig {
  if (status === 'running') {
    return {
      defaultIcon: <Icon name="loader-circle" className="animate-spin" color="text-current" />,
      hoverIcon: onStop ? <Icon name="square" color="text-current" /> : null,
      hoverLabel: onStop ? 'Stop agent' : null,
      hoverAction: onStop ?? null,
    };
  }
  if (status === 'idle') {
    return {
      defaultIcon: <Icon name="circle" color="text-current" />,
      hoverIcon: onArchive ? <Icon name="check" color="text-current" /> : null,
      hoverLabel: onArchive ? 'Archive agent' : null,
      hoverAction: onArchive ?? null,
    };
  }
  if (status === 'failed') {
    return {
      defaultIcon: <Icon name="circle-x" color="text-current" />,
      hoverIcon: null,
      hoverLabel: null,
      hoverAction: null,
    };
  }
  return {
    defaultIcon: <Icon name="circle-check" color="text-current" />,
    hoverIcon: null,
    hoverLabel: null,
    hoverAction: null,
  };
}

function agentLabel(agent: AgentRecord): string {
  return agent.name.length > 0 ? agent.name : agent.id;
}

export function AgentSidebarItem(props: AgentSidebarItemProps) {
  const { active, agent, onSelect, onStop, onArchive } = props;
  const config = iconConfigForStatus(agent.status, onStop, onArchive);
  const textClass = active ? 'text-accent' : 'text-content-muted hover:text-content';
  const rootClass = `group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[12px] leading-4 transition-colors ${textClass}`;

  const handleIconClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    config.hoverAction?.();
  };

  const iconNode =
    config.hoverIcon && config.hoverAction ? (
      <button
        aria-label={config.hoverLabel ?? undefined}
        className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center text-accent hover:text-content"
        onClick={handleIconClick}
        type="button"
      >
        <span className="absolute inset-0 inline-flex items-center justify-center transition-opacity group-hover:opacity-0">
          {config.defaultIcon}
        </span>
        <span className="absolute inset-0 inline-flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          {config.hoverIcon}
        </span>
      </button>
    ) : (
      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-accent">{config.defaultIcon}</span>
    );

  return (
    <div className={rootClass}>
      <button
        className="min-w-0 flex-1 truncate text-left font-heading font-normal tracking-[0.08em]"
        onClick={onSelect}
        type="button"
      >
        {agentLabel(agent)}
      </button>
      {iconNode}
    </div>
  );
}
