'use client';

import { Background, BackgroundVariant, Controls, type Edge, type Node, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEffect, useState } from 'react';
import { buildTaskFlowGraph, type FlowEdge, type FlowGraph, type FlowNode } from './layout';
import { PoolNode } from './pool-node';
import { RoutedEdge } from './routed-edge';
import { TaskNode } from './task-node';
import type { TaskGraphInput } from './types';

export type { TaskGraphInput, TaskGraphInputDependency, TaskGraphInputPool, TaskGraphInputTask } from './types';

export interface TaskGraphProps {
  graph: TaskGraphInput;
  selectedTaskId?: string;
  onSelectTask?: (taskId: string) => void;
}

const NODE_TYPES = { task: TaskNode, pool: PoolNode };
const EDGE_TYPES = { routed: RoutedEdge };

export function TaskGraph(props: TaskGraphProps) {
  const layout = useElkLayout(props.graph);

  const onNodeClick = (_event: unknown, node: Node) => {
    if (node.type !== 'task') return;
    props.onSelectTask?.(node.id);
  };

  if (layout === null) {
    return <div className="h-full w-full" />;
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={layout.nodes.map((node) => toReactFlowNode(node, props.selectedTaskId))}
        edges={layout.edges.map(toReactFlowEdge)}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        onNodeClick={onNodeClick}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesConnectable={false}
        edgesFocusable={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="var(--color-border)" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

function useElkLayout(input: TaskGraphInput): FlowGraph | null {
  const [layout, setLayout] = useState<FlowGraph | null>(null);
  useEffect(() => {
    let cancelled = false;
    void buildTaskFlowGraph(input).then((result) => {
      if (!cancelled) setLayout(result);
    });
    return () => {
      cancelled = true;
    };
  }, [input]);
  return layout;
}

function toReactFlowNode(node: FlowNode, selectedTaskId: string | undefined): Node {
  const base: Node = {
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data,
    draggable: false,
    selectable: node.type === 'task',
    selected: node.type === 'task' && node.id === selectedTaskId,
  };
  if (node.parentId !== undefined) base.parentId = node.parentId;
  if (node.type === 'pool') {
    base.style = { width: node.width, height: node.height };
    base.zIndex = -1;
  }
  return base;
}

function toReactFlowEdge(edge: FlowEdge): Edge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'routed',
    data: { points: edge.points },
  };
}
