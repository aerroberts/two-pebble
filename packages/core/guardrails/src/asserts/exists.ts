import type { WorkspaceNode } from '@two-pebble/traversal';
import type { AssertOutcome } from './types';

/**
 * Asserts that a structure find returned (or did not return) any nodes.
 */
export function existsAssertion(nodes: WorkspaceNode[], expected: boolean): AssertOutcome {
  const found = nodes.length > 0;
  if (found === expected) {
    return { passed: true };
  }
  return {
    passed: false,
    description: expected
      ? 'Expected the structure find to return at least one node, but none matched.'
      : 'Expected the structure find to return no nodes, but at least one matched.',
  };
}
