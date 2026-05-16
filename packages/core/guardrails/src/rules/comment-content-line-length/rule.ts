import type { TraversalNode } from '@two-pebble/traversal';
import type { StructureRangeRuleConfig } from '../../types';
import { StructureRule } from '../structure-rule';

/**
 * Checks stripped comment content line count.
 * Syntax lines like opening and closing block comment markers are ignored.
 */
export class Rule extends StructureRule<StructureRangeRuleConfig> {
  public readonly key = 'commentContentLineLength';

  protected evaluateNode(node: TraversalNode, value: StructureRangeRuleConfig) {
    const actual = this.stringProperty(node, 'commentContent').split('\n').length;
    if (value.min !== undefined && actual < value.min) {
      return [this.failure(node, `Expected at least ${value.min} comment content lines, found ${actual}.`)];
    }
    if (value.max !== undefined && actual > value.max) {
      return [this.failure(node, `Expected at most ${value.max} comment content lines, found ${actual}.`)];
    }
    return [];
  }
}
