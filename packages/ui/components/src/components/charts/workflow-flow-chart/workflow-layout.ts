import { WORKFLOW_LAYOUT } from './constants';
import type { ComputeLayoutInput, WorkflowEdge, WorkflowLayoutResult, WorkflowNode, WorkflowPosition } from './types';

const { NODE_WIDTH, NODE_HEIGHT, COL_GAP, ROW_GAP, CHILD_ITEM_HEIGHT, CHILD_GAP_FROM_PARENT, GROUP_ITEM_HEIGHT } =
  WORKFLOW_LAYOUT;

export function computeChildCardHeight(childCount: number) {
  return childCount * CHILD_ITEM_HEIGHT + Math.max(0, childCount - 1);
}

export function computeGroupCardHeight(itemCount: number) {
  return itemCount * GROUP_ITEM_HEIGHT + Math.max(0, itemCount - 1);
}

export function nodeRenderedHeight(node: WorkflowNode): number {
  if (node.group && node.group.length > 0) {
    return computeGroupCardHeight(node.group.length);
  }
  return NODE_HEIGHT;
}

function nodeEffectiveHeight(node: WorkflowNode) {
  const rendered = nodeRenderedHeight(node);
  if (node.children && node.children.length > 0) {
    return rendered + CHILD_GAP_FROM_PARENT + computeChildCardHeight(node.children.length);
  }
  return rendered;
}

function buildGraphEdges(nodes: Array<WorkflowNode>, edges: Array<WorkflowEdge>) {
  const incoming = new Map<string, Array<string>>();
  const outgoing = new Map<string, Array<string>>();
  nodes.forEach((n) => {
    incoming.set(n.id, []);
    outgoing.set(n.id, []);
  });
  edges.forEach((e) => {
    outgoing.get(e.source)?.push(e.target);
    incoming.get(e.target)?.push(e.source);
  });
  return { incoming, outgoing };
}

function topologicalDepths(nodes: Array<WorkflowNode>, incoming: Map<string, Array<string>>): Map<string, number> {
  const depths = new Map<string, number>();
  let currentDepth = 0;
  const remaining = new Set(nodes.map((n) => n.id));

  while (remaining.size > 0) {
    const nextLayer = Array.from(remaining).filter((id) => {
      const inc = incoming.get(id);
      if (!inc) return true;
      return inc.every((dep) => !remaining.has(dep));
    });
    if (nextLayer.length === 0) {
      const breaker = remaining.values().next().value;
      if (breaker) nextLayer.push(breaker);
    }
    for (const id of nextLayer) {
      depths.set(id, currentDepth);
      remaining.delete(id);
    }
    currentDepth++;
  }
  return depths;
}

function buildColumns(nodes: Array<WorkflowNode>, depths: Map<string, number>) {
  const maxDepth = Math.max(0, ...Array.from(depths.values())) + 1;
  const columns: Array<Array<WorkflowNode>> = Array.from({ length: maxDepth }, () => []);
  nodes.forEach((n) => {
    const d = depths.get(n.id) ?? 0;
    columns[d].push(n);
  });
  return columns;
}

function positionColumns(columns: Array<Array<WorkflowNode>>) {
  let maxColHeight = 0;
  columns.forEach((col) => {
    let h = 0;
    col.forEach((node, i) => {
      h += nodeEffectiveHeight(node);
      if (i < col.length - 1) h += ROW_GAP;
    });
    maxColHeight = Math.max(maxColHeight, h);
  });

  const positions = new Map<string, WorkflowPosition>();
  let maxX = 0;

  columns.forEach((colNodes, colIndex) => {
    const x = colIndex * (NODE_WIDTH + COL_GAP);
    maxX = Math.max(maxX, x + NODE_WIDTH);
    let currentY = 0;
    colNodes.forEach((node) => {
      positions.set(node.id, { x, y: currentY });
      currentY += nodeEffectiveHeight(node) + ROW_GAP;
    });
  });

  return { positions, width: maxX, height: maxColHeight };
}

export function computeLayout(input: ComputeLayoutInput): WorkflowLayoutResult {
  const { incoming } = buildGraphEdges(input.nodes, input.edges);
  const depths = topologicalDepths(input.nodes, incoming);
  const columns = buildColumns(input.nodes, depths);
  return positionColumns(columns);
}

export function defaultEdges(nodes: Array<WorkflowNode>): Array<WorkflowEdge> {
  return nodes.slice(0, -1).map((n, i) => ({ source: n.id, target: nodes[i + 1].id }));
}
