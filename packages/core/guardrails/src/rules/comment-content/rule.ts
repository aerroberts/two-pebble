import type { TraversalNode } from '@two-pebble/traversal';
import type { StructureStringRuleConfig } from '../../types';
import { StructureRule } from '../structure-rule';

/**
 * Checks stripped comment content on selected comment tokens.
 */
export class Rule extends StructureRule<string | StructureStringRuleConfig> {
  public readonly key = 'commentContent';

  protected evaluateNode(node: TraversalNode, value: string | StructureStringRuleConfig) {
    return this.stringExpectationFailures({
      node,
      actual: this.stringProperty(node, 'commentContent'),
      value,
      label: 'commentContent',
    });
  }
}
