import { WORKFLOW_LAYOUT } from './constants';
import type { WorkflowChildNode, WorkflowNode, WorkflowPosition } from './types';
import { WorkflowListItem } from './workflow-list-card';

const { NODE_WIDTH, GROUP_ITEM_HEIGHT } = WORKFLOW_LAYOUT;

interface WorkflowGroupNodeCardProps {
  node: WorkflowNode;
  position: WorkflowPosition;
  onNodeClick?: (node: WorkflowNode | WorkflowChildNode) => void;
}

export function WorkflowGroupNodeCard(props: WorkflowGroupNodeCardProps) {
  const items = props.node.group ?? [];
  return (
    <div
      className="absolute rounded border border-border/70 bg-surface"
      style={{ left: props.position.x, top: props.position.y, width: NODE_WIDTH }}
    >
      <div className="flex flex-col divide-y divide-border">
        {items.map((item) => (
          <WorkflowListItem key={item.id} item={item} itemHeight={GROUP_ITEM_HEIGHT} onNodeClick={props.onNodeClick} />
        ))}
      </div>
    </div>
  );
}
