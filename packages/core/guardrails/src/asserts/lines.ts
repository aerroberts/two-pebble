import type { WorkspaceNode } from '@two-pebble/traversal';
import type { AssertOutcome, NumberRange } from '../types';

/**
 * Asserts each matched node spans a number of source lines that satisfies the
 * exactly/min/max range. Nodes without range metadata fail the assertion.
 */
export function linesAssertion(nodes: WorkspaceNode[], range: NumberRange): AssertOutcome {
  if (nodes.length === 0) {
    return { passed: false, description: 'Expected lines metadata, but the find returned no nodes.' };
  }
  for (const node of nodes) {
    const span = node.lines;
    if (span === undefined) {
      return { passed: false, description: `Node of type "${node.type}" has no source line metadata.` };
    }
    const failure = describeOutOfRange(span, range);
    if (failure) {
      return { passed: false, description: failure };
    }
  }
  return { passed: true };
}

function describeOutOfRange(value: number, range: NumberRange) {
  if (range.exactly !== undefined && value !== range.exactly) {
    return `Expected ${range.exactly} lines, but a matched node spans ${value}.`;
  }
  if (range.min !== undefined && value < range.min) {
    return `Expected at least ${range.min} lines, but a matched node spans ${value}.`;
  }
  if (range.max !== undefined && value > range.max) {
    return `Expected at most ${range.max} lines, but a matched node spans ${value}.`;
  }
  return undefined;
}
