export interface SankeyLink {
  from: string;
  to: string;
  count: number;
}

export interface SankeyStage {
  header: string;
  links: Array<SankeyLink>;
}

export interface SankeyChartProps {
  stages: Array<SankeyStage>;
  columnHeaders?: Array<string>;
  nodeColors?: Record<string, string>;
  linkColors?: Record<string, string>;
  emptyMessage?: string;
  className?: string;
}

export interface SNode {
  id: string;
  label: string;
  col: number;
  value: number;
  color: string;
  linkColor: string;
  x: number;
  y: number;
  height: number;
}

export interface SLinkInternal {
  source: string;
  target: string;
  value: number;
  sy0: number;
  sy1: number;
  ty0: number;
  ty1: number;
  color: string;
}

export interface SankeyLayout {
  nodes: Array<SNode>;
  links: Array<SLinkInternal>;
  svgWidth: number;
  svgHeight: number;
}

export interface BuildGraphInput {
  stages: Array<SankeyStage>;
  nodeColors: Record<string, string>;
  linkColors: Record<string, string>;
}

export interface BuildGraphResult {
  nodes: Array<SNode>;
  links: Array<SLinkInternal>;
}

export interface LayoutGraphInput {
  nodes: Array<SNode>;
  links: Array<SLinkInternal>;
  numCols: number;
  chartWidth: number;
}
