import type { WorkflowChildNode, WorkflowNode, WorkflowPosition } from './types';
import { WorkflowGroupNodeCard } from './workflow-group-node-card';
import { WorkflowNodeCard } from './workflow-node-card';

interface WorkflowNodeRendererProps {
  node: WorkflowNode;
  position: WorkflowPosition;
  onNodeClick?: (node: WorkflowNode | WorkflowChildNode) => void;
}

export function WorkflowNodeRenderer(props: WorkflowNodeRendererProps) {
  const { node, position, onNodeClick } = props;
  if (node.group && node.group.length > 0) {
    return <WorkflowGroupNodeCard node={node} position={position} onNodeClick={onNodeClick} />;
  }
  return <WorkflowNodeCard node={node} position={position} onNodeClick={onNodeClick} />;
}
