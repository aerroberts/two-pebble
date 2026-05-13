import type { WorkflowChildNode, WorkflowNode, WorkflowPosition } from './types';
import { WorkflowChildGroupCard } from './workflow-child-group-card';
import { WorkflowNodeRenderer } from './workflow-node-renderer';

interface WorkflowNodesLayerProps {
  nodes: Array<WorkflowNode>;
  positions: Map<string, WorkflowPosition>;
  onNodeClick?: (node: WorkflowNode | WorkflowChildNode) => void;
}

export function WorkflowNodesLayer(props: WorkflowNodesLayerProps) {
  return (
    <>
      {props.nodes.map((node) => {
        const position = props.positions.get(node.id);
        if (!position) {
          return null;
        }
        return <WorkflowNodeRenderer key={node.id} node={node} position={position} onNodeClick={props.onNodeClick} />;
      })}
      {props.nodes.map((node) => {
        if (!node.children || node.children.length === 0) {
          return null;
        }
        const pos = props.positions.get(node.id);
        if (!pos) {
          return null;
        }
        return (
          <WorkflowChildGroupCard
            key={`children-${node.id}`}
            items={node.children}
            parentPos={pos}
            onNodeClick={props.onNodeClick}
          />
        );
      })}
    </>
  );
}
