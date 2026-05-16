import type { TraversalNode } from '@two-pebble/traversal';
import { StructureRule } from '../structure-rule';

/**
 * Checks whether selected function nodes are async.
 */
export class Rule extends StructureRule<boolean> {
  public readonly key = 'async';

  protected evaluateNode(node: TraversalNode, value: boolean) {
    const actual = node.property('async');
    return actual === value
      ? []
      : [this.failure(node, `Expected async to be ${String(value)}, found ${String(actual)}.`)];
  }
}
