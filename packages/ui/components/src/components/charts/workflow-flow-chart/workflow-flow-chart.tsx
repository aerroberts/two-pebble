'use client';

import { useMemo } from 'react';
import type { WorkflowFlowChartProps, WorkflowNode } from './types';
import { WorkflowEdgesLayer } from './workflow-edges-layer';
import { computeLayout, defaultEdges } from './workflow-layout';
import { WorkflowNodesLayer } from './workflow-nodes-layer';

export type {
  WorkflowChildNode,
  WorkflowEdge,
  WorkflowFlowChartProps,
  WorkflowNode,
} from './types';

const PADDING = 16;

export function WorkflowFlowChart(props: WorkflowFlowChartProps) {
  const { nodes, edges, className = '', emptyMessage = 'No workflow data to display', onNodeClick } = props;

  const effectiveEdges = useMemo(() => edges ?? defaultEdges(nodes), [edges, nodes]);
  const layout = useMemo(() => computeLayout({ nodes, edges: effectiveEdges }), [nodes, effectiveEdges]);
  const nodeMap = useMemo(() => {
    const m = new Map<string, WorkflowNode>();
    for (const n of nodes) {
      m.set(n.id, n);
    }
    return m;
  }, [nodes]);

  if (nodes.length === 0) {
    return (
      <div
        className={`flex items-center justify-center h-32 text-sm text-content-muted border border-dashed border-border rounded-lg ${className}`}
      >
        {emptyMessage}
      </div>
    );
  }

  const { positions, width, height } = layout;
  const svgWidth = width + PADDING * 2;
  const svgHeight = height + PADDING * 2;

  return (
    <div className={`w-full min-w-0 ${className}`}>
      <div className="relative" style={{ width: svgWidth, height: svgHeight }}>
        <svg
          className="absolute inset-0 pointer-events-none text-border"
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          role="img"
          aria-label="Workflow diagram"
        >
          <title>Workflow diagram</title>
          <g transform={`translate(${PADDING}, ${PADDING})`}>
            <WorkflowEdgesLayer nodes={nodes} edges={effectiveEdges} positions={positions} nodeMap={nodeMap} />
          </g>
        </svg>

        <div className="absolute inset-0" style={{ transform: `translate(${PADDING}px, ${PADDING}px)` }}>
          <WorkflowNodesLayer nodes={nodes} positions={positions} onNodeClick={onNodeClick} />
        </div>
      </div>
    </div>
  );
}
