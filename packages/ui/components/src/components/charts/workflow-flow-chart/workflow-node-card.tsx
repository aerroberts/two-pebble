import type { CSSProperties, ReactNode } from 'react';

import { Tooltip } from '../../providers/tooltip/tooltip-trigger';
import { WORKFLOW_LAYOUT } from './constants';
import type { WorkflowChildNode, WorkflowNode, WorkflowPosition } from './types';
import { WorkflowNodeContent } from './workflow-node-content';

const { NODE_WIDTH, NODE_HEIGHT } = WORKFLOW_LAYOUT;

interface WorkflowNodeCardProps {
  node: WorkflowNode;
  position: WorkflowPosition;
  onNodeClick?: (node: WorkflowNode | WorkflowChildNode) => void;
}

export function WorkflowNodeCard(props: WorkflowNodeCardProps) {
  const { node, position, onNodeClick } = props;
  const isSelected = Boolean(node.selected);
  const isClickable = Boolean(node.href || onNodeClick);

  const wrapperStyle: CSSProperties = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
  };
  if (isSelected && node.selectedBgColor) {
    wrapperStyle.backgroundColor = node.selectedBgColor;
  }
  const bgClass = isSelected ? '' : 'bg-surface';
  const cardClasses = `flex h-full w-full flex-col justify-center overflow-hidden rounded border border-border px-2.5 text-left transition-all ${bgClass} ${isClickable ? 'cursor-pointer hover:shadow-sm' : ''}`;

  const content = <WorkflowNodeContent node={node} />;

  let inner: ReactNode;
  if (node.href) {
    inner = (
      <a
        href={node.href}
        onClick={(e) => {
          if (onNodeClick) {
            e.preventDefault();
            onNodeClick(node);
          }
        }}
        className={`focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 rounded ${cardClasses}`}
        style={wrapperStyle}
      >
        {content}
      </a>
    );
  } else if (onNodeClick) {
    inner = (
      <button
        type="button"
        onClick={() => onNodeClick(node)}
        className={`focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 rounded ${cardClasses}`}
        style={wrapperStyle}
      >
        {content}
      </button>
    );
  } else {
    inner = (
      <div className={cardClasses} style={wrapperStyle}>
        {content}
      </div>
    );
  }

  const tooltip = node.tooltip;
  if (tooltip && Object.keys(tooltip).length > 0) {
    return (
      <Tooltip header={node.title} data={tooltip} side="top" sideOffset={8}>
        {inner}
      </Tooltip>
    );
  }
  return inner;
}
