export interface WorkflowChildNode {
  id: string;
  title: string;
  icon?: string;
  iconColor?: string;
  tooltip?: Record<string, string>;
  href?: string;
}

export interface WorkflowNode {
  id: string;
  title: string;
  subtitle?: string;
  rightValue?: string;
  icon?: string;
  iconColor?: string;
  tooltip?: Record<string, string>;
  href?: string;
  children?: Array<WorkflowChildNode>;
  selected?: boolean;
  selectedBgColor?: string;
  group?: Array<WorkflowChildNode>;
}

export interface WorkflowEdge {
  source: string;
  target: string;
}

export interface WorkflowFlowChartProps {
  nodes: Array<WorkflowNode>;
  edges?: Array<WorkflowEdge>;
  className?: string;
  emptyMessage?: string;
  onNodeClick?: (node: WorkflowNode | WorkflowChildNode) => void;
}

export interface WorkflowPosition {
  x: number;
  y: number;
}

export interface WorkflowLayoutResult {
  positions: Map<string, WorkflowPosition>;
  width: number;
  height: number;
}

export interface ComputeLayoutInput {
  nodes: Array<WorkflowNode>;
  edges: Array<WorkflowEdge>;
}
