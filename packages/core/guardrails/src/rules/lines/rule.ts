import type { TraversalNode } from '@two-pebble/traversal';
import type { StructureRangeRuleConfig } from '../../types';
import { StructureRule } from '../structure-rule';

/**
 * Checks the line count of selected nodes.
 * File nodes use full file text.
 * Token nodes use source text for that translated token.
 */
export class Rule extends StructureRule<StructureRangeRuleConfig> {
  public readonly key = 'lines';

  protected evaluateEmpty() {
    return [];
  }

  protected evaluateNode(node: TraversalNode, value: StructureRangeRuleConfig) {
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
