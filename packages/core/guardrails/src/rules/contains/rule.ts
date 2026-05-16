import type { TraversalNode } from '@two-pebble/traversal';
import { StructureRule } from '../structure-rule';

/**
 * Checks that selected node text includes a required substring.
 * File nodes use full file text.
 * Token nodes use source text for that translated token.
 */
export class Rule extends StructureRule<string | string[]> {
  public readonly key = 'contains';

  protected evaluateNode(node: TraversalNode, value: string | string[]) {
    const text = this.stringProperty(node, 'text');
    return this.values(value).flatMap((expected) =>
      text.includes(expected) ? [] : [this.failure(node, `Expected node text to contain ${expected}.`)],
    );
  }

  private values(value: string | string[]) {
    return Array.isArray(value) ? value : [value];
  }
}
