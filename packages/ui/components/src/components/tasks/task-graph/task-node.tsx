import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';
import { Icon } from '../../content/icon/icon';
import type { TaskStatusIconStatus } from '../task-status-icon/types';

export type TaskNodeData = { name: string; status: TaskStatusIconStatus };
export type TaskFlowNode = Node<TaskNodeData, 'task'>;

interface TaskNodeStatusConfig {
  bg: string;
  ring: string;
  icon: string;
  iconColor: string;
  spin?: boolean;
  opacity?: string;
}

const TASK_NODE_CONFIG: Record<TaskStatusIconStatus, TaskNodeStatusConfig> = {
  blocked: {
    bg: 'bg-surface-alt',
    ring: 'ring-1 ring-border',
    icon: 'slash',
    iconColor: 'text-content-muted',
    opacity: 'opacity-60',
  },
  open: { bg: 'bg-surface', ring: 'ring-1 ring-border', icon: 'dot', iconColor: 'text-content-muted' },
  working: { bg: 'bg-surface', ring: '', icon: 'dot', iconColor: 'text-accent', spin: true },
  waiting: { bg: 'bg-surface', ring: 'ring-1 ring-border', icon: 'square', iconColor: 'text-content-muted' },
  success: {
    bg: 'bg-success-soft',
    ring: 'ring-1 ring-success-ring',
    icon: 'check',
    iconColor: 'text-success',
  },
  failure: {
    bg: 'bg-danger-soft',
    ring: 'ring-1 ring-danger-ring',
    icon: 'x',
    iconColor: 'text-danger',
  },
};

export function TaskNode(props: NodeProps<TaskFlowNode>) {
  const config = TASK_NODE_CONFIG[props.data.status];
  const wrapperClass =
    `relative flex h-9 w-9 items-center justify-center rounded-full transition-colors ${config.bg} ${config.ring} ${config.opacity ?? ''}`.trim();
  return (
    <div aria-label={props.data.name} className={wrapperClass}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} isConnectable={false} />
      {config.spin ? (
        <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      ) : null}
      <Icon name={config.icon} color={config.iconColor} className="size-4" />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} isConnectable={false} />
    </div>
  );
}
