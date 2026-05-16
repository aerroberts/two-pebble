import type { WorkspaceNode } from '@two-pebble/traversal';
import type { AssertOutcome } from '../types';

/**
 * Asserts every matched node carries the expected `name` property.
 */
export function validate(nodes: WorkspaceNode[], expected: string): AssertOutcome {
  if (nodes.length === 0) {
    return { passed: true };
  }
  for (const node of nodes) {
    const actual = node.getProperty('name');
    if (actual !== expected) {
      return {
        passed: false,
        description: `Expected a node named "${expected}", but found "${actual ?? '<unnamed>'}".`,
      };
    }
  }
  return { passed: true };
}
