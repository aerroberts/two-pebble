import type { TraversalNode } from '@two-pebble/traversal';
import { StructureAssertion } from '../../structure-assertion';

/**
 * Checks whether a structure query selected at least one node.
 * This assertion is the only one where an empty set can pass.
 * It supports both must-exist and must-not-exist policies.
 */
export class Assert extends StructureAssertion<boolean> {
  public readonly key = 'exists';

  /**
   * Evaluates existence against the selected node set instead of each node.
   */
  public evaluate(nodes: TraversalNode[], value: boolean) {
    const exists = nodes.length > 0;
    return exists === value ? [] : [this.failure(nodes[0], `Expected existence to be ${String(value)}.`)];
  }

  /**
   * Exists uses the collection-level override above.
   */
  protected evaluateNode() {
    return [];
  }
}
