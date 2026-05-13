import { Icon } from '../../content/icon/icon';
import { Tooltip } from '../../providers/tooltip/tooltip-trigger';
import type { WorkflowChildNode, WorkflowNode } from './types';

export interface WorkflowListItemProps {
  item: WorkflowChildNode;
  itemHeight: number;
  iconSize?: number;
  onNodeClick?: (node: WorkflowNode | WorkflowChildNode) => void;
}

export function WorkflowListItem(props: WorkflowListItemProps) {
  const { item, itemHeight, onNodeClick } = props;
  const clickable = Boolean(item.href || onNodeClick);

  const inner = (
    <div
      className={`flex items-center gap-1.5 px-1.5 ${clickable ? 'cursor-pointer hover:bg-surface-hover' : ''}`}
      style={{ height: itemHeight }}
    >
      {item.icon ? (
        <span className="shrink-0" style={{ color: item.iconColor }}>
          <Icon name={item.icon} color={item.iconColor ? 'text-current' : undefined} />
        </span>
      ) : null}
      <div className="min-w-0 flex-1 truncate text-[11px] text-content">{item.title}</div>
    </div>
  );

  const wrappedInner = item.href ? (
    <a
      href={item.href}
      onClick={(e) => {
        if (onNodeClick) {
          e.preventDefault();
          onNodeClick(item);
        }
      }}
      className="focus:outline-none"
    >
      {inner}
    </a>
  ) : clickable ? (
    <button type="button" onClick={() => onNodeClick?.(item)} className="w-full text-left focus:outline-none">
      {inner}
    </button>
  ) : (
    inner
  );

  if (item.tooltip && Object.keys(item.tooltip).length > 0) {
    return (
      <Tooltip header={item.title} data={item.tooltip} side="right" sideOffset={8}>
        {wrappedInner}
      </Tooltip>
    );
  }

  return wrappedInner;
}
