import type { TraversalNode } from '@two-pebble/traversal';
import type { StructureStringRuleConfig } from '../../types';
import { StructureRule } from '../structure-rule';

/**
 * Checks module specifiers on selected import tokens.
 */
export class Rule extends StructureRule<string | StructureStringRuleConfig> {
  public readonly key = 'importPath';

  protected evaluateNode(node: TraversalNode, value: string | StructureStringRuleConfig) {
    return this.stringExpectationFailures({
      node,
      actual: this.stringProperty(node, 'importPath'),
      value,
      label: 'importPath',
    });
  }
}
