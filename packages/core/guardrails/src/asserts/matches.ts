import type { WorkspaceNode } from '@two-pebble/traversal';
import type { AssertOutcome, NumberRange } from '../types';

/**
 * Asserts the number of nodes returned by a find satisfies an exactly/min/max range.
 */
export function validate(nodes: WorkspaceNode[], range: NumberRange): AssertOutcome {
  const count = nodes.length;
  if (range.exactly !== undefined && count !== range.exactly) {
    return { passed: false, description: `Expected exactly ${range.exactly} matches, but found ${count}.` };
  }
  if (range.min !== undefined && count < range.min) {
    return { passed: false, description: `Expected at least ${range.min} matches, but found ${count}.` };
  }
  if (range.max !== undefined && count > range.max) {
    return { passed: false, description: `Expected at most ${range.max} matches, but found ${count}.` };
  }
  return { passed: true };
}
