import {
  AppBox,
  AppButton,
  AppIconSwap,
  AppSidebarItemFrame,
  AppSpinningIcon,
  Icon,
  SidebarSubitem,
} from '@two-pebble/components';
import type { AgentRecord, AgentStatus } from '@two-pebble/realtime';
import type { MouseEvent, ReactNode } from 'react';

interface AgentSidebarItemProps {
  active: boolean;
  agent: AgentRecord;
  onSelect: () => void;
  onStop?: () => void;
  onArchive?: () => void;
  onResume?: () => void;
  onFail?: () => void;
}

type AgentSidebarSubitemProps = AgentSidebarItemProps;

interface IconConfig {
  defaultIcon: ReactNode;
  hoverIcon: ReactNode | null;
  hoverLabel: string | null;
  hoverAction: (() => void) | null;
}

interface IconConfigInput {
  status: AgentStatus;
  onStop?: () => void;
  onArchive?: () => void;
  onResume?: () => void;
  onFail?: () => void;
}

function iconConfigForStatus(input: IconConfigInput): IconConfig {
  if (input.status === 'running') {
    return {
      defaultIcon: <AppSpinningIcon name="loader-circle" />,
      hoverIcon: input.onStop ? <Icon name="square" color="text-current" /> : null,
      hoverLabel: input.onStop ? 'Stop agent' : null,
      hoverAction: input.onStop ?? null,
    };
  }
  if (input.status === 'idle') {
    return {
      defaultIcon: <Icon name="circle" color="text-current" />,
      hoverIcon: input.onArchive ? <Icon name="check" color="text-current" /> : null,
      hoverLabel: input.onArchive ? 'Archive agent' : null,
      hoverAction: input.onArchive ?? null,
    };
  }
  if (input.status === 'waiting') {
    return {
      defaultIcon: <Icon name="clock" color="text-current" />,
      hoverIcon: input.onFail ? <Icon name="circle-x" color="text-current" /> : null,
      hoverLabel: input.onFail ? 'Mark agent as failed' : null,
      hoverAction: input.onFail ?? null,
    };
  }
  if (input.status === 'interrupted') {
    return {
      defaultIcon: <Icon name="triangle-alert" color="text-current" />,
      hoverIcon: input.onResume ? <Icon name="arrow-up" color="text-current" /> : null,
      hoverLabel: input.onResume ? 'Resume agent' : null,
      hoverAction: input.onResume ?? null,
    };
  }
  if (input.status === 'failed') {
    return {
      defaultIcon: <Icon name="circle-x" color="text-current" />,
      hoverIcon: null,
      hoverLabel: null,
      hoverAction: null,
    };
  }
  if (input.status === 'offline') {
    return {
      defaultIcon: <Icon name="circle-check" color="text-current" />,
      hoverIcon: null,
      hoverLabel: null,
      hoverAction: null,
    };
  }
  return {
    defaultIcon: <Icon name="circle" color="text-current" />,
    hoverIcon: null,
    hoverLabel: null,
    hoverAction: null,
  };
}

function agentLabel(agent: AgentRecord): string {
  return agent.name.length > 0 ? agent.name : agent.id;
}

type AgentSidebarStatusIconProps = Pick<
  AgentSidebarItemProps,
  'agent' | 'onArchive' | 'onFail' | 'onResume' | 'onStop'
> & {
  subdued?: boolean;
};

function AgentSidebarStatusIcon(props: AgentSidebarStatusIconProps) {
  const { agent, onStop, onArchive, onResume, onFail, subdued = false } = props;
  const config = iconConfigForStatus({ status: agent.status, onStop, onArchive, onResume, onFail });
  const handleIconClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    config.hoverAction?.();
  };

  if (config.hoverIcon && config.hoverAction) {
    if (subdued) {
      return (
        <button
          aria-label={config.hoverLabel ?? undefined}
          className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center text-current hover:text-content"
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
      );
    }
    return (
      <AppIconSwap
        aria-label={config.hoverLabel ?? undefined}
        defaultIcon={config.defaultIcon}
        hoverIcon={config.hoverIcon}
        onClick={handleIconClick}
        type="button"
      />
    );
  }

  if (subdued) {
    return (
      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-current">
        {config.defaultIcon}
      </span>
    );
  }

  return (
    <AppBox as="span" variant="icon-static">
      {config.defaultIcon}
    </AppBox>
  );
}

export function AgentSidebarItem(props: AgentSidebarItemProps) {
  const { active, agent, onSelect, onStop, onArchive, onResume, onFail } = props;

  return (
    <AppSidebarItemFrame active={active}>
      <AppButton onClick={onSelect} type="button" variant="sidebar-label">
        {agentLabel(agent)}
      </AppButton>
      <AgentSidebarStatusIcon agent={agent} onArchive={onArchive} onFail={onFail} onResume={onResume} onStop={onStop} />
    </AppSidebarItemFrame>
  );
}

export function AgentSidebarSubitem(props: AgentSidebarSubitemProps) {
  const { active, agent, onSelect, onStop, onArchive, onResume, onFail } = props;
  return (
    <SidebarSubitem
      active={active}
      label={agentLabel(agent)}
      onClick={onSelect}
      trailing={
        <AgentSidebarStatusIcon
          agent={agent}
          onArchive={onArchive}
          onFail={onFail}
          onResume={onResume}
          onStop={onStop}
          subdued
        />
      }
    />
  );
}
