import { Icon } from '../../content/icon/icon';
import type { WorkflowNode } from './types';

interface WorkflowNodeContentProps {
  node: WorkflowNode;
}

export function WorkflowNodeContent(props: WorkflowNodeContentProps) {
  const { node } = props;
  const hasSubtitle = Boolean(node.subtitle);
  return (
    <div className="flex items-center gap-2">
      {node.icon ? (
        <span className="shrink-0" style={{ color: node.iconColor }}>
          <Icon name={node.icon} color={node.iconColor ? 'text-current' : undefined} />
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium leading-tight text-content">{node.title}</div>
        {hasSubtitle ? <div className="truncate text-[10px] text-content-muted mt-[1px]">{node.subtitle}</div> : null}
      </div>
      {node.rightValue ? <div className="shrink-0 pl-1 text-[11px] text-content-muted">{node.rightValue}</div> : null}
    </div>
  );
}
