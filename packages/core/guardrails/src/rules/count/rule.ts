import type { TraversalNode } from '@two-pebble/traversal';
import type { StructureRangeRuleConfig } from '../../types';
import { StructureRule } from '../structure-rule';

/**
 * Checks how many nodes were selected by a structure query.
 * Traversed rules evaluate count per parent node.
 */
export class Rule extends StructureRule<StructureRangeRuleConfig> {
  public readonly key = 'count';

  /**
   * Count evaluates the selected collection instead of each node.
   */
  public evaluate(nodes: TraversalNode[], value: StructureRangeRuleConfig) {
    const actual = nodes.length;
    if (value.min !== undefined && actual < value.min) {
      return [this.failure(nodes[0], `Expected at least ${value.min} nodes, found ${actual}.`)];
    }
    if (value.max !== undefined && actual > value.max) {
      return [this.failure(nodes[value.max] ?? nodes[0], `Expected at most ${value.max} nodes, found ${actual}.`)];
    }
    return [];
  }

  /**
   * Count uses the collection-level override above.
   */
  protected evaluateNode() {
    return [];
  }
}
