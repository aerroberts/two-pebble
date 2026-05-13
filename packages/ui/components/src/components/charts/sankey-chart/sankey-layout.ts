import { CHART_DEFAULT_LINK_COLOR, CHART_DEFAULT_NODE_COLOR } from '../utils/chart-colors';
import { SANKEY_LAYOUT } from './constants';
import type { BuildGraphInput, BuildGraphResult, LayoutGraphInput, SankeyLayout, SLinkInternal, SNode } from './types';

export function buildGraph(input: BuildGraphInput): BuildGraphResult {
  const { stages, nodeColors, linkColors } = input;
  const nodeMap = new Map<string, SNode>();
  const links: Array<SLinkInternal> = [];

  const getOrCreate = (col: number, label: string): SNode => {
    const id = `${col}:${label}`;
    const existing = nodeMap.get(id);
    if (existing) {
      return existing;
    }
    const node: SNode = {
      id,
      label,
      col,
      value: 0,
      color: nodeColors[label] ?? CHART_DEFAULT_NODE_COLOR,
      linkColor: linkColors[label] ?? CHART_DEFAULT_LINK_COLOR,
      x: 0,
      y: 0,
      height: 0,
    };
    nodeMap.set(id, node);
    return node;
  };

  for (let i = 0; i < stages.length; i++) {
    for (const { from, to, count } of stages[i].links) {
      if (count <= 0) {
        continue;
      }
      const sNode = getOrCreate(i, from);
      const tNode = getOrCreate(i + 1, to);
      links.push({
        source: sNode.id,
        target: tNode.id,
        value: count,
        sy0: 0,
        sy1: 0,
        ty0: 0,
        ty1: 0,
        color: sNode.linkColor,
      });
    }
  }

  const outgoing = new Map<string, number>();
  const incoming = new Map<string, number>();
  for (const l of links) {
    outgoing.set(l.source, (outgoing.get(l.source) ?? 0) + l.value);
    incoming.set(l.target, (incoming.get(l.target) ?? 0) + l.value);
  }
  for (const n of nodeMap.values()) {
    n.value = Math.max(outgoing.get(n.id) ?? 0, incoming.get(n.id) ?? 0);
  }

  return { nodes: Array.from(nodeMap.values()), links };
}

function layoutColumns(nodes: Array<SNode>, numCols: number, chartWidth: number) {
  const usableWidth = chartWidth - SANKEY_LAYOUT.LEFT_PAD - SANKEY_LAYOUT.RIGHT_PAD;
  const colSpacing = usableWidth / (numCols - 1 || 1);

  const columns: Array<Array<SNode>> = Array.from({ length: numCols }, () => []);
  for (const n of nodes) {
    columns[n.col].push(n);
  }
  for (const col of columns) {
    col.sort((a, b) => b.value - a.value);
  }
  for (const n of nodes) {
    n.x = SANKEY_LAYOUT.LEFT_PAD + n.col * colSpacing;
  }

  for (const col of columns) {
    if (col.length === 0) {
      continue;
    }
    const totalValue = col.reduce((s, n) => s + n.value, 0);
    const totalPad = SANKEY_LAYOUT.NODE_PAD * (col.length - 1);
    const availableHeight = SANKEY_LAYOUT.BODY_HEIGHT - totalPad;
    const scale = totalValue > 0 ? availableHeight / totalValue : 0;

    let y = SANKEY_LAYOUT.TOP_PAD;
    for (const n of col) {
      n.height = Math.max(2, n.value * scale);
      n.y = y;
      y += n.height + SANKEY_LAYOUT.NODE_PAD;
    }

    const totalUsed = y - SANKEY_LAYOUT.NODE_PAD - SANKEY_LAYOUT.TOP_PAD;
    const offset = (SANKEY_LAYOUT.BODY_HEIGHT - totalUsed) / 2;
    if (offset > 0) {
      for (const n of col) {
        n.y += offset;
      }
    }
  }
}

function assignLinkBands(nodes: Array<SNode>, links: Array<SLinkInternal>) {
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const linksBySource = new Map<string, Array<SLinkInternal>>();
  const linksByTarget = new Map<string, Array<SLinkInternal>>();

  for (const link of links) {
    const s = linksBySource.get(link.source) ?? [];
    s.push(link);
    linksBySource.set(link.source, s);
    const t = linksByTarget.get(link.target) ?? [];
    t.push(link);
    linksByTarget.set(link.target, t);
  }

  for (const [, sLinks] of linksBySource) {
    sLinks.sort((a, b) => (nodeById.get(a.target)?.y ?? 0) - (nodeById.get(b.target)?.y ?? 0));
  }
  for (const [, tLinks] of linksByTarget) {
    tLinks.sort((a, b) => (nodeById.get(a.source)?.y ?? 0) - (nodeById.get(b.source)?.y ?? 0));
  }

  for (const [sourceId, sLinks] of linksBySource) {
    const sNode = nodeById.get(sourceId);
    if (!sNode) {
      continue;
    }
    const totalOut = sLinks.reduce((s, l) => s + l.value, 0);
    const scale = totalOut > 0 ? sNode.height / totalOut : 0;
    let y = sNode.y;
    for (const link of sLinks) {
      const bandH = link.value * scale;
      link.sy0 = y;
      link.sy1 = y + bandH;
      y += bandH;
    }
  }

  for (const [targetId, tLinks] of linksByTarget) {
    const tNode = nodeById.get(targetId);
    if (!tNode) {
      continue;
    }
    const totalIn = tLinks.reduce((s, l) => s + l.value, 0);
    const scale = totalIn > 0 ? tNode.height / totalIn : 0;
    let y = tNode.y;
    for (const link of tLinks) {
      const bandH = link.value * scale;
      link.ty0 = y;
      link.ty1 = y + bandH;
      y += bandH;
    }
  }
}

export function layoutGraph(input: LayoutGraphInput): SankeyLayout {
  const { nodes, links, numCols, chartWidth } = input;
  layoutColumns(nodes, numCols, chartWidth);
  assignLinkBands(nodes, links);
  return {
    nodes,
    links,
    svgWidth: chartWidth,
    svgHeight: SANKEY_LAYOUT.TOP_PAD + SANKEY_LAYOUT.BODY_HEIGHT + SANKEY_LAYOUT.BOTTOM_PAD,
  };
}

export function computeHeaderPositions(
  nodes: Array<SNode>,
  numCols: number,
  columnHeaders: Array<string>,
): Array<{ x: number; label: string }> {
  const headerPositions: Array<{ x: number; label: string }> = [];
  for (let col = 0; col < numCols; col++) {
    const colNode = nodes.find((n) => n.col === col);
    if (!colNode) {
      continue;
    }
    const label = col < columnHeaders.length ? columnHeaders[col] : '';
    if (label) {
      headerPositions.push({ x: colNode.x, label });
    }
  }
  return headerPositions;
}

export interface BandPathInput {
  x0: number;
  x1: number;
  sy0: number;
  sy1: number;
  ty0: number;
  ty1: number;
}

export function bandPath(input: BandPathInput) {
  const { x0, x1, sy0, sy1, ty0, ty1 } = input;
  const mx = (x0 + x1) / 2;
  return [
    `M${x0},${sy0}`,
    `C${mx},${sy0} ${mx},${ty0} ${x1},${ty0}`,
    `L${x1},${ty1}`,
    `C${mx},${ty1} ${mx},${sy1} ${x0},${sy1}`,
    'Z',
  ].join(' ');
}
