import type { WorkspaceNode } from '@two-pebble/traversal';
import type { AssertOutcome } from '../types';

/**
 * Asserts every matched node has the expected token type.
 */
export function typeAssertion(nodes: WorkspaceNode[], expected: string): AssertOutcome {
  if (nodes.length === 0) {
    return {
      passed: false,
      description: `Expected matched nodes to be of type "${expected}", but the find returned no nodes.`,
    };
  }
  const mismatch = nodes.find((node) => node.type !== expected);
  if (mismatch) {
    return {
      passed: false,
      description: `Expected nodes of type "${expected}", but found a node of type "${mismatch.type}".`,
    };
  }
  return { passed: true };
}
