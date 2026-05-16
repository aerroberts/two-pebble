import type { TraversalFunctionKind, TraversalNode } from '@two-pebble/traversal';
import { StructureRule } from '../structure-rule';

/**
 * Checks whether selected function tokens are declarations, methods, arrows, or expressions.
 */
export class Rule extends StructureRule<TraversalFunctionKind> {
  public readonly key = 'functionKind';

  protected evaluateNode(node: TraversalNode, value: TraversalFunctionKind) {
    const actual = node.property('functionKind');
    return actual === value ? [] : [this.failure(node, `Expected functionKind ${value}, found ${String(actual)}.`)];
  }
}
