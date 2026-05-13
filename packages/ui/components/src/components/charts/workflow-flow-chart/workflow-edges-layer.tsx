import { WORKFLOW_LAYOUT } from './constants';
import type { WorkflowEdge, WorkflowNode, WorkflowPosition } from './types';
import { WorkflowChildEdgePath } from './workflow-child-edge-path';
import { WorkflowEdgePath } from './workflow-edge-path';
import { nodeRenderedHeight } from './workflow-layout';

const { NODE_HEIGHT } = WORKFLOW_LAYOUT;

interface WorkflowEdgesLayerProps {
  nodes: Array<WorkflowNode>;
  edges: Array<WorkflowEdge>;
  positions: Map<string, WorkflowPosition>;
  nodeMap: Map<string, WorkflowNode>;
}

export function WorkflowEdgesLayer(props: WorkflowEdgesLayerProps) {
  return (
    <>
      {props.edges.map((edge) => {
        const sourcePos = props.positions.get(edge.source);
        const targetPos = props.positions.get(edge.target);
        if (!sourcePos || !targetPos) return null;
        const sourceNode = props.nodeMap.get(edge.source);
        const targetNode = props.nodeMap.get(edge.target);
        return (
          <WorkflowEdgePath
            key={`${edge.source}->${edge.target}`}
            sourcePos={sourcePos}
            targetPos={targetPos}
            sourceHeight={sourceNode ? nodeRenderedHeight(sourceNode) : NODE_HEIGHT}
            targetHeight={targetNode ? nodeRenderedHeight(targetNode) : NODE_HEIGHT}
          />
        );
      })}
      {props.nodes.map((node) => {
        if (!node.children || node.children.length === 0) return null;
        const pos = props.positions.get(node.id);
        if (!pos) return null;
        return <WorkflowChildEdgePath key={`child-edge-${node.id}`} parentPos={pos} />;
      })}
    </>
  );
}
