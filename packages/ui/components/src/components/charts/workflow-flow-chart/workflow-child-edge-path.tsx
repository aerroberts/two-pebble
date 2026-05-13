import { WORKFLOW_LAYOUT } from './constants';
import type { WorkflowPosition } from './types';

const { NODE_WIDTH, NODE_HEIGHT, CHILD_GAP_FROM_PARENT, CHILD_ARROW_GAP } = WORKFLOW_LAYOUT;

interface WorkflowChildEdgePathProps {
  parentPos: WorkflowPosition;
}

export function WorkflowChildEdgePath(props: WorkflowChildEdgePathProps) {
  const centerX = props.parentPos.x + NODE_WIDTH / 2;
  const startY = props.parentPos.y + NODE_HEIGHT;
  const endY = startY + CHILD_GAP_FROM_PARENT;
  const arrowSize = 3;

  return (
    <g>
      <line x1={centerX} y1={startY} x2={centerX} y2={endY} stroke="currentColor" strokeWidth={1.25} />
      <polygon
        points={`${centerX - arrowSize},${startY + CHILD_ARROW_GAP} ${centerX},${startY} ${centerX + arrowSize},${startY + CHILD_ARROW_GAP}`}
        fill="currentColor"
      />
    </g>
  );
}
