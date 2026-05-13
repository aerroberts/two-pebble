import { AppBox, AppButton, AppIconSwap, AppSidebarItemFrame, AppSpinningIcon, Icon } from '@two-pebble/components';
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

interface IconConfigInput {
  status: AgentStatus;
  onStop?: () => void;
  onArchive?: () => void;
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
      hoverIcon: null,
      hoverLabel: null,
      hoverAction: null,
    };
  }
  if (input.status === 'interrupted') {
    return {
      defaultIcon: <Icon name="triangle-alert" color="text-current" />,
      hoverIcon: null,
      hoverLabel: null,
      hoverAction: null,
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

export function AgentSidebarItem(props: AgentSidebarItemProps) {
  const { active, agent, onSelect, onStop, onArchive } = props;
  const config = iconConfigForStatus({ status: agent.status, onStop, onArchive });
  const handleIconClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    config.hoverAction?.();
  };

  const iconNode =
    config.hoverIcon && config.hoverAction ? (
      <AppIconSwap
        aria-label={config.hoverLabel ?? undefined}
        defaultIcon={config.defaultIcon}
        hoverIcon={config.hoverIcon}
        onClick={handleIconClick}
        type="button"
      />
    ) : (
      <AppBox as="span" variant="icon-static">
        {config.defaultIcon}
      </AppBox>
    );

  return (
    <AppSidebarItemFrame active={active}>
      <AppButton onClick={onSelect} type="button" variant="sidebar-label">
        {agentLabel(agent)}
      </AppButton>
      {iconNode}
    </AppSidebarItemFrame>
  );
}
