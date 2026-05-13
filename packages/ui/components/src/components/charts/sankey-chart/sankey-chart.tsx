'use client';

import { useMemo } from 'react';
import { SANKEY_LAYOUT } from './constants';
import { bandPath, buildGraph, computeHeaderPositions, layoutGraph } from './sankey-layout';
import type { SankeyChartProps } from './types';

const { NODE_WIDTH, NODE_RADIUS, LABEL_GAP, CHART_WIDTH } = SANKEY_LAYOUT;

export type { SankeyChartProps, SankeyLink, SankeyStage } from './types';

export function SankeyChart(props: SankeyChartProps) {
  const stages = props.stages;
  const nodeColors = props.nodeColors ?? {};
  const linkColors = props.linkColors ?? {};
  const emptyMessage = props.emptyMessage ?? 'No data available';
  const className = props.className ?? '';
  const resolvedColumnHeaders = props.columnHeaders ?? stages.map((s) => s.header);
  const numCols = stages.length + 1;

  const computed = useMemo(() => {
    const graph = buildGraph({ stages, nodeColors, linkColors });
    if (graph.links.length === 0) return null;
    return layoutGraph({ nodes: graph.nodes, links: graph.links, numCols, chartWidth: CHART_WIDTH });
  }, [stages, nodeColors, linkColors, numCols]);

  if (!computed) {
    return (
      <div className={`flex items-center justify-center h-48 text-sm text-content-muted ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  const { nodes, links, svgWidth, svgHeight } = computed;
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const headerPositions = computeHeaderPositions(nodes, numCols, resolvedColumnHeaders);

  return (
    <div className={`w-full min-w-0 overflow-hidden ${className}`}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full block text-content-muted"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Sankey chart"
      >
        <title>Sankey chart</title>
        <g fill="currentColor">
          {headerPositions.map((hp) => (
            <text
              key={hp.label}
              x={hp.x}
              y={12}
              fontSize={9}
              fontWeight={600}
              letterSpacing="0.05em"
              className="select-none"
            >
              {hp.label.toUpperCase()}
            </text>
          ))}
        </g>
        {links.map((link) => {
          const sNode = nodeById.get(link.source);
          const tNode = nodeById.get(link.target);
          if (!sNode || !tNode) return null;
          return (
            <path
              key={`${link.source}->${link.target}`}
              d={bandPath({
                x0: sNode.x + NODE_WIDTH,
                x1: tNode.x,
                sy0: link.sy0,
                sy1: link.sy1,
                ty0: link.ty0,
                ty1: link.ty1,
              })}
              fill={link.color}
            />
          );
        })}
        <g className="text-content">
          {nodes.map((node) => (
            <g key={node.id}>
              <rect x={node.x} y={node.y} width={NODE_WIDTH} height={node.height} rx={NODE_RADIUS} fill={node.color} />
              <text
                x={node.x + NODE_WIDTH + LABEL_GAP}
                y={node.y + node.height / 2}
                dominantBaseline="central"
                fontSize={9}
                fill="currentColor"
                className="select-none"
              >
                {node.label} ({node.value.toLocaleString()})
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
