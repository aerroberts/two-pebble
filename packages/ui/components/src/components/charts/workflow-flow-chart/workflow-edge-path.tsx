import { WORKFLOW_LAYOUT } from './constants';
import type { WorkflowPosition } from './types';

const { NODE_WIDTH, NODE_HEIGHT } = WORKFLOW_LAYOUT;

interface WorkflowEdgePathProps {
  sourcePos: WorkflowPosition;
  targetPos: WorkflowPosition;
  sourceHeight?: number;
  targetHeight?: number;
}

export function WorkflowEdgePath(props: WorkflowEdgePathProps) {
  const sourceHeight = props.sourceHeight ?? NODE_HEIGHT;
  const targetHeight = props.targetHeight ?? NODE_HEIGHT;
  const startX = props.sourcePos.x + NODE_WIDTH;
  const startY = props.sourcePos.y + sourceHeight / 2;
  const endX = props.targetPos.x;
  const endY = props.targetPos.y + targetHeight / 2;

  const controlPointOffset = Math.max(20, (endX - startX) / 2);
  const cp1X = startX + controlPointOffset;
  const cp2X = endX - controlPointOffset;
  const arrowSize = 4;

  return (
    <g>
      <path
        d={`M ${startX} ${startY} C ${cp1X} ${startY} ${cp2X} ${endY} ${endX} ${endY}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
      />
      <polygon
        points={`${startX},${startY - arrowSize} ${startX + arrowSize * 1.5},${startY} ${startX},${startY + arrowSize}`}
        fill="currentColor"
      />
    </g>
  );
}
