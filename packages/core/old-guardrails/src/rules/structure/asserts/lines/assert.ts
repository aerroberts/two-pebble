import type { TraversalNode } from '@two-pebble/traversal';
import { StructureAssertion } from '../../structure-assertion';
import type { StructureRangeAssertConfig } from '../../types';

/**
 * Checks the line count of selected nodes.
 * File nodes use full file text.
 * Token nodes use source text for that translated token.
 */
export class Assert extends StructureAssertion<StructureRangeAssertConfig> {
  public readonly key = 'lines';

  protected evaluateEmpty() {
    return [];
  }

  protected evaluateNode(node: TraversalNode, value: StructureRangeAssertConfig) {
    const actual = this.numberProperty(node, 'lines');
    if (value.min !== undefined && actual < value.min) {
      return [this.failure(node, `Expected at least ${value.min} lines, found ${actual}.`)];
    }
    if (value.max !== undefined && actual > value.max) {
      return [this.failure(node, `Expected at most ${value.max} lines, found ${actual}.`)];
    }
    return [];
  }
}
