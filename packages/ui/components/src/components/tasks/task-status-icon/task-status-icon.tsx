import { Icon } from '../../content/icon/icon';
import type { TaskStatusIconSize, TaskStatusIconStatus } from './types';

export type { TaskStatusIconSize, TaskStatusIconStatus } from './types';

export interface TaskStatusIconProps {
  status: TaskStatusIconStatus;
  size?: TaskStatusIconSize;
}

interface StatusConfig {
  iconName: string;
  color: string;
  animation?: string;
}

const STATUS_CONFIG: Record<TaskStatusIconStatus, StatusConfig> = {
  blocked: { iconName: 'slash', color: 'text-content-muted' },
  open: { iconName: 'circle-dot-dashed', color: 'text-content-subtle' },
  working: { iconName: 'loader-circle', color: 'text-accent', animation: 'animate-spin' },
  waiting: { iconName: 'square', color: 'text-content-muted' },
  success: { iconName: 'check', color: 'text-success' },
  failure: { iconName: 'x', color: 'text-danger' },
};

const SIZE_CLASS: Record<TaskStatusIconSize, string> = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
};

export function TaskStatusIcon(props: TaskStatusIconProps) {
  const config = STATUS_CONFIG[props.status];
  const size = props.size ?? 'md';
  const className = `${SIZE_CLASS[size]} ${config.animation ?? ''}`.trim();
  return <Icon name={config.iconName} color={config.color} className={className} />;
}
