import type { TraversalNode } from '@two-pebble/traversal';
import type { StructureRangeRuleConfig } from '../../types';
import { StructureRule } from '../structure-rule';

/**
 * Checks the character count of selected token text.
 * Non-token nodes fail because the assertion is token-specific.
 * Min and max bounds can be used independently.
 */
export class Rule extends StructureRule<StructureRangeRuleConfig> {
  public readonly key = 'tokenCharLength';

  protected evaluateNode(node: TraversalNode, value: StructureRangeRuleConfig) {
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
