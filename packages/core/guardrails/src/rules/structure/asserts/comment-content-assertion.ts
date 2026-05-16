import type { TraversalNode } from '@two-pebble/traversal';
import type { StructureStringAssertConfig } from '../types';
import { StructureAssertion } from './structure-assertion';

/**
 * Checks stripped comment content on selected comment tokens.
 */
export class CommentContentAssertion extends StructureAssertion<string | StructureStringAssertConfig> {
  public readonly key = 'commentContent';

  protected evaluateNode(node: TraversalNode, value: string | StructureStringAssertConfig) {
    return this.stringExpectationFailures({
      node,
      actual: this.stringProperty(node, 'commentContent'),
      value,
      label: 'commentContent',
    });
  }
}
