import { BaseEdge, type Edge, type EdgeProps, getBezierPath } from '@xyflow/react';

export type RoutedEdgeData = { points: { x: number; y: number }[] };
export type RoutedEdge = Edge<RoutedEdgeData, 'routed'>;

const CORNER_RADIUS = 8;

export function RoutedEdge(props: EdgeProps<RoutedEdge>) {
  const points = props.data?.points ?? [];
  const path = points.length >= 2 ? buildRoundedPath(points, CORNER_RADIUS) : fallbackPath(props);
  return <BaseEdge path={path} style={{ stroke: 'var(--color-border-strong)', strokeWidth: 1.5 }} />;
}

function fallbackPath(props: EdgeProps<RoutedEdge>): string {
  const [d] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
  });
  return d;
}

function buildRoundedPath(points: { x: number; y: number }[], radius: number): string {
  const segments: string[] = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const before = clampToCorner(prev, curr, radius);
    const after = clampToCorner(next, curr, radius);
    segments.push(`L ${before.x} ${before.y}`);
    segments.push(`Q ${curr.x} ${curr.y} ${after.x} ${after.y}`);
  }
  const last = points[points.length - 1];
  segments.push(`L ${last.x} ${last.y}`);
  return segments.join(' ');
}

function clampToCorner(
  source: { x: number; y: number },
  corner: { x: number; y: number },
  radius: number,
): { x: number; y: number } {
  const dx = source.x - corner.x;
  const dy = source.y - corner.y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0) {
    return corner;
  }
  const offset = Math.min(radius, distance / 2);
  return { x: corner.x + (dx / distance) * offset, y: corner.y + (dy / distance) * offset };
}
