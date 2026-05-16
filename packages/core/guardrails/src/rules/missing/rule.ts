import type { TraversalNode } from '@two-pebble/traversal';
import { StructureRule } from '../structure-rule';

/**
 * Checks that selected node text omits a forbidden substring.
 * File nodes use full file text.
 * Token nodes use source text for that translated token.
 */
export class Rule extends StructureRule<string | string[]> {
  public readonly key = 'missing';

  protected evaluateNode(node: TraversalNode, value: string | string[]) {
    const text = this.stringProperty(node, 'text');
    return this.values(value).flatMap((forbidden) =>
      text.includes(forbidden) ? [this.failure(node, `Expected node text to omit ${forbidden}.`)] : [],
    );
  }

  private values(value: string | string[]) {
    return Array.isArray(value) ? value : [value];
  }
}
