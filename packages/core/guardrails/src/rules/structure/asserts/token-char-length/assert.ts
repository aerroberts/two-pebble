import type { TraversalNode } from '@two-pebble/traversal';
import { StructureAssertion } from '../../structure-assertion';
import type { StructureRangeAssertConfig } from '../../types';

/**
 * Checks the character count of selected token text.
 * Non-token nodes fail because the assertion is token-specific.
 * Min and max bounds can be used independently.
 */
export class Assert extends StructureAssertion<StructureRangeAssertConfig> {
  public readonly key = 'tokenCharLength';

  protected evaluateNode(node: TraversalNode, value: StructureRangeAssertConfig) {
    if (node.property('kind') !== 'token') {
      return [this.failure(node, 'tokenCharLength can only be asserted against token nodes.')];
    }

    const text = this.stringProperty(node, 'text');
    if (value.min !== undefined && text.length < value.min) {
      return [this.failure(node, `Expected at least ${value.min} characters, found ${text.length}.`)];
    }
    if (value.max !== undefined && text.length > value.max) {
      return [this.failure(node, `Expected at most ${value.max} characters, found ${text.length}.`)];
    }
    return [];
  }
}
