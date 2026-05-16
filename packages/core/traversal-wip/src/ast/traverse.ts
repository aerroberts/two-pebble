import { TraversalResultSet } from '../result-set';
import type { WorkspaceNode } from './workspace-node';

/**
 * Traverse our custom ast
 */
export function traverse(query: string, node: WorkspaceNode) {
  const segments = query.split('/');
  const results = new TraversalResultSet();
  const nodes = recurseSegment(segments, node);
  for (const node of nodes) {
    results.add(node);
  }
  return results;
}

function recurseSegment(segments: string[], node: WorkspaceNode): WorkspaceNode[] {
  // Base case
  if (segments.length === 0) {
    return [node];
  }

  // If there is nothing left, we are good
  const [segment, ...rest] = segments;
  if (segment === '') {
    return [];
  }

  const { type, modifier } = parseSegment(segment);

  // Modifier-driven selection looks at sibling relationships rather than direct
  // type matches against children.
  if (modifier === 'before') {
    return matchBefore(type, node, rest);
  }

  // If there is a segment, try to match it to children
  const results: WorkspaceNode[] = [];

  for (const child of node.children) {
    if (matchesType(child, type)) {
      results.push(...recurseSegment(rest, child));
    }
  }

  return results;
}

function matchBefore(type: string, node: WorkspaceNode, rest: string[]): WorkspaceNode[] {
  const results: WorkspaceNode[] = [];
  for (let index = 0; index < node.children.length - 1; index += 1) {
    const current = node.children[index];
    const next = node.children[index + 1];
    if (matchesType(next, type)) {
      results.push(...recurseSegment(rest, current));
    }
  }
  return results;
}

function matchesType(node: WorkspaceNode, type: string) {
  return type === '*' || node.type === type;
}

function parseSegment(segment: string): { type: string; modifier?: string } {
  const dollarIndex = segment.indexOf('$');
  if (dollarIndex === -1) {
    return { type: segment };
  }
  return { type: segment.slice(0, dollarIndex), modifier: segment.slice(dollarIndex + 1) };
}
