import type { TraversalNode } from '@two-pebble/traversal';
import { StructureAssertion } from './structure-assertion';

/**
 * Checks whether selected function nodes are async.
 */
export class AsyncAssertion extends StructureAssertion<boolean> {
  public readonly key = 'async';

  protected evaluateNode(node: TraversalNode, value: boolean) {
    const actual = node.property('async');
    return actual === value
      ? []
      : [this.failure(node, `Expected async to be ${String(value)}, found ${String(actual)}.`)];
  }
}
