import type { TraversalNode } from '@two-pebble/traversal';
import { StructureAssertion } from '../../structure-assertion';
import type { StructureRangeAssertConfig } from '../../types';

/**
 * Checks the line count of selected token text.
 * Non-token nodes fail because the assertion is token-specific.
 * Min and max bounds can be used independently.
 */
export class Assert extends StructureAssertion<StructureRangeAssertConfig> {
  public readonly key = 'tokenLineLength';

  protected evaluateNode(node: TraversalNode, value: StructureRangeAssertConfig) {
    if (node.property('kind') !== 'token') {
      return [this.failure(node, 'tokenLineLength can only be asserted against token nodes.')];
    }

    const actual = this.stringProperty(node, 'text').split('\n').length;
    if (value.min !== undefined && actual < value.min) {
      return [this.failure(node, `Expected at least ${value.min} lines, found ${actual}.`)];
    }
    if (value.max !== undefined && actual > value.max) {
      return [this.failure(node, `Expected at most ${value.max} lines, found ${actual}.`)];
    }
    return [];
  }
}
