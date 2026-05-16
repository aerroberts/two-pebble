import type { TraversalNode } from '@two-pebble/traversal';
import { StructureAssertion } from '../../structure-assertion';
import type { StructureStringAssertConfig } from '../../types';

/**
 * Checks stripped comment content on selected comment tokens.
 */
export class Assert extends StructureAssertion<string | StructureStringAssertConfig> {
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
