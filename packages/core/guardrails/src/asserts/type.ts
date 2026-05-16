import type { WorkspaceNode } from '@two-pebble/traversal';
import type { AssertOutcome } from '../types';

/**
 * Asserts every matched node has the expected token type.
 */
export function validate(nodes: WorkspaceNode[], expected: string): AssertOutcome {
  if (nodes.length === 0) {
    return { passed: true };
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
