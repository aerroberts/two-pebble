import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';
import { Icon } from '../../content/icon/icon';

export type PoolNodeData = { name: string };
export type PoolFlowNode = Node<PoolNodeData, 'pool'>;

export function PoolNode(props: PoolNodeProps) {
  return (
    <div className="h-full w-full overflow-hidden rounded-sm border border-border bg-pool-tint">
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} isConnectable={false} />
      <div className="flex items-center justify-center gap-1.5 border-b border-border bg-pool-header px-3 pt-2 pb-1.5 text-content-muted">
        <Icon name="blocks" color="text-current" className="size-3.5" />
        <span className="truncate text-[11px] font-semibold uppercase tracking-wide">{props.data.name}</span>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} isConnectable={false} />
    </div>
  );
}

type PoolNodeProps = NodeProps<PoolFlowNode>;
