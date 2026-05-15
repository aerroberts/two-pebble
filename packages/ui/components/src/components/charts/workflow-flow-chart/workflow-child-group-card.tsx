import { WORKFLOW_LAYOUT } from './constants';
import type { WorkflowChildNode, WorkflowNode, WorkflowPosition } from './types';
import { WorkflowListItem } from './workflow-list-card';

const { NODE_WIDTH, NODE_HEIGHT, CHILD_GAP_FROM_PARENT, CHILD_ITEM_HEIGHT } = WORKFLOW_LAYOUT;

interface WorkflowChildGroupCardProps {
  items: Array<WorkflowChildNode>;
  parentPos: WorkflowPosition;
  onNodeClick?: (node: WorkflowNode | WorkflowChildNode) => void;
}

export function WorkflowChildGroupCard(props: WorkflowChildGroupCardProps) {
  const top = props.parentPos.y + NODE_HEIGHT + CHILD_GAP_FROM_PARENT;
  return (
    <div
      className="absolute rounded border border-border bg-surface"
      style={{ left: props.parentPos.x, top, width: NODE_WIDTH }}
    >
      <div className="flex flex-col divide-y divide-border">
        {props.items.map((child) => (
          <WorkflowListItem
            key={child.id}
            item={child}
            itemHeight={CHILD_ITEM_HEIGHT}
            onNodeClick={props.onNodeClick}
          />
        ))}
      </div>
    </div>
  );
}
