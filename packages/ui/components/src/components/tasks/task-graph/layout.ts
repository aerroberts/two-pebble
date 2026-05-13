import ELK from 'elkjs/lib/elk.bundled.js';
import type { ElkExtendedEdge, ElkNode } from 'elkjs/lib/elk-api';
import { TASK_NODE_HEIGHT, TASK_NODE_WIDTH } from './constants';
import type { TaskGraphInput, TaskGraphInputDependency, TaskGraphInputPool, TaskGraphInputTask } from './types';

export interface FlowNode {
  id: string;
  type: 'task' | 'pool';
  parentId?: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  data: { name: string; status?: string };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  points: { x: number; y: number }[];
}

export interface FlowGraph {
  nodes: FlowNode[];
  edges: FlowEdge[];
  rootWidth: number;
  rootHeight: number;
}

let elk: InstanceType<typeof ELK> | undefined;

const ROOT_LAYOUT_OPTIONS: Record<string, string> = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
  'elk.layered.edgeRouting': 'ORTHOGONAL',
  'elk.spacing.nodeNode': '40',
  'elk.layered.spacing.nodeNodeBetweenLayers': '60',
  'elk.spacing.edgeNode': '24',
  'elk.spacing.edgeEdge': '16',
  'elk.padding': '[top=12,left=16,bottom=16,right=16]',
};

const POOL_LAYOUT_OPTIONS: Record<string, string> = {
  'elk.padding': '[top=40,left=20,bottom=20,right=20]',
  'elk.spacing.nodeNode': '32',
  'elk.layered.spacing.nodeNodeBetweenLayers': '48',
};

const POOL_HEADER_FIXED_WIDTH = 56;
const POOL_HEADER_CHAR_WIDTH = 7.2;
const POOL_MIN_HEIGHT = 80;

export async function buildTaskFlowGraph(input: TaskGraphInput): Promise<FlowGraph> {
  const elkInput = buildElkTree(input);
  const result = await layoutEngine().layout(elkInput, { layoutOptions: ROOT_LAYOUT_OPTIONS });
  return convertElkResult(result, input);
}

function layoutEngine(): InstanceType<typeof ELK> {
  if (elk === undefined) {
    elk = new ELK();
  }
  return elk;
}

function buildElkTree(input: TaskGraphInput): ElkNode {
  const tasksByPool = groupTasksByPool(input.tasks);
  const poolsByParent = groupPoolsByParent(input.pools);
  const edgesByContainer = groupEdgesByContainer(input);
  return {
    id: '__root__',
    children: buildLevelChildren(null, tasksByPool, poolsByParent, edgesByContainer),
    edges: edgesAtContainer(null, edgesByContainer),
  };
}

function buildLevelChildren(
  poolId: string | null,
  tasksByPool: Map<string | null, TaskGraphInputTask[]>,
  poolsByParent: Map<string | null, TaskGraphInputPool[]>,
  edgesByContainer: Map<string | null, TaskGraphInputDependency[]>,
): ElkNode[] {
  const tasks = tasksByPool.get(poolId) ?? [];
  const pools = poolsByParent.get(poolId) ?? [];
  const taskNodes: ElkNode[] = tasks.map((task) => ({
    id: task.id,
    width: TASK_NODE_WIDTH,
    height: TASK_NODE_HEIGHT,
  }));
  const poolNodes: ElkNode[] = pools.map((pool) => ({
    id: pool.id,
    layoutOptions: { ...POOL_LAYOUT_OPTIONS, 'elk.nodeSize.minimum': poolMinSize(pool) },
    children: buildLevelChildren(pool.id, tasksByPool, poolsByParent, edgesByContainer),
    edges: edgesAtContainer(pool.id, edgesByContainer),
  }));
  return [...poolNodes, ...taskNodes];
}

function poolMinSize(pool: TaskGraphInputPool): string {
  const width = POOL_HEADER_FIXED_WIDTH + pool.name.length * POOL_HEADER_CHAR_WIDTH;
  return `(${width}, ${POOL_MIN_HEIGHT})`;
}

function groupTasksByPool(tasks: TaskGraphInputTask[]): Map<string | null, TaskGraphInputTask[]> {
  const map = new Map<string | null, TaskGraphInputTask[]>();
  for (const task of tasks) {
    const list = map.get(task.poolId) ?? [];
    list.push(task);
    map.set(task.poolId, list);
  }
  return map;
}

function groupPoolsByParent(pools: TaskGraphInputPool[]): Map<string | null, TaskGraphInputPool[]> {
  const map = new Map<string | null, TaskGraphInputPool[]>();
  for (const pool of pools) {
    const list = map.get(pool.parentPoolId) ?? [];
    list.push(pool);
    map.set(pool.parentPoolId, list);
  }
  return map;
}

function groupEdgesByContainer(input: TaskGraphInput): Map<string | null, TaskGraphInputDependency[]> {
  const parentOf = new Map<string, string | null>();
  for (const task of input.tasks) {
    parentOf.set(task.id, task.poolId);
  }
  for (const pool of input.pools) {
    parentOf.set(pool.id, pool.parentPoolId);
  }
  const map = new Map<string | null, TaskGraphInputDependency[]>();
  for (const dep of input.dependencies) {
    const container = parentOf.get(dep.fromId) ?? null;
    const list = map.get(container) ?? [];
    list.push(dep);
    map.set(container, list);
  }
  return map;
}

function edgesAtContainer(
  poolId: string | null,
  edgesByContainer: Map<string | null, TaskGraphInputDependency[]>,
): ElkExtendedEdge[] {
  const deps = edgesByContainer.get(poolId) ?? [];
  return deps.map((dep) => ({
    id: `${dep.fromId}-${dep.toId}`,
    sources: [dep.toId],
    targets: [dep.fromId],
  }));
}

function convertElkResult(result: ElkNode, input: TaskGraphInput): FlowGraph {
  const taskMap = new Map<string, TaskGraphInputTask>();
  for (const task of input.tasks) {
    taskMap.set(task.id, task);
  }
  const poolMap = new Map<string, TaskGraphInputPool>();
  for (const pool of input.pools) {
    poolMap.set(pool.id, pool);
  }

  const flowNodes: FlowNode[] = [];
  const flowEdges: FlowEdge[] = [];
  walkElkNode(result, null, { x: 0, y: 0 }, taskMap, poolMap, flowNodes, flowEdges);
  return {
    nodes: flowNodes,
    edges: flowEdges,
    rootWidth: result.width ?? 0,
    rootHeight: result.height ?? 0,
  };
}

function walkElkNode(
  elkNode: ElkNode,
  parentId: string | null,
  absoluteOrigin: { x: number; y: number },
  taskMap: Map<string, TaskGraphInputTask>,
  poolMap: Map<string, TaskGraphInputPool>,
  flowNodes: FlowNode[],
  flowEdges: FlowEdge[],
): void {
  for (const child of elkNode.children ?? []) {
    const x = child.x ?? 0;
    const y = child.y ?? 0;
    const childAbsolute = { x: absoluteOrigin.x + x, y: absoluteOrigin.y + y };
    appendFlowNode(child, parentId, taskMap, poolMap, flowNodes);
    if (child.children && child.children.length > 0) {
      walkElkNode(child, child.id, childAbsolute, taskMap, poolMap, flowNodes, flowEdges);
    }
  }
  for (const elkEdge of elkNode.edges ?? []) {
    const ext = elkEdge as ElkExtendedEdge;
    const points = collectEdgePoints(ext, absoluteOrigin);
    flowEdges.push({
      id: ext.id,
      source: ext.sources[0],
      target: ext.targets[0],
      points,
    });
  }
}

function appendFlowNode(
  child: ElkNode,
  parentId: string | null,
  taskMap: Map<string, TaskGraphInputTask>,
  poolMap: Map<string, TaskGraphInputPool>,
  flowNodes: FlowNode[],
): void {
  const x = child.x ?? 0;
  const y = child.y ?? 0;
  const task = taskMap.get(child.id);
  if (task) {
    flowNodes.push({
      id: child.id,
      type: 'task',
      ...(parentId !== null ? { parentId } : {}),
      position: { x, y },
      width: child.width ?? TASK_NODE_WIDTH,
      height: child.height ?? TASK_NODE_HEIGHT,
      data: { name: task.name, status: task.status },
    });
    return;
  }
  const pool = poolMap.get(child.id);
  if (pool) {
    flowNodes.push({
      id: child.id,
      type: 'pool',
      ...(parentId !== null ? { parentId } : {}),
      position: { x, y },
      width: child.width ?? 0,
      height: child.height ?? 0,
      data: { name: pool.name },
    });
  }
}

function collectEdgePoints(
  edge: ElkExtendedEdge,
  absoluteOrigin: { x: number; y: number },
): { x: number; y: number }[] {
  const section = edge.sections?.[0];
  if (!section) {
    return [];
  }
  const points: { x: number; y: number }[] = [];
  points.push({ x: section.startPoint.x + absoluteOrigin.x, y: section.startPoint.y + absoluteOrigin.y });
  for (const bp of section.bendPoints ?? []) {
    points.push({ x: bp.x + absoluteOrigin.x, y: bp.y + absoluteOrigin.y });
  }
  points.push({ x: section.endPoint.x + absoluteOrigin.x, y: section.endPoint.y + absoluteOrigin.y });
  return points;
}
