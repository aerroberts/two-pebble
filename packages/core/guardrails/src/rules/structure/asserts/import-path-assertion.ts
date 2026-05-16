import type { TraversalNode } from '@two-pebble/traversal';
import type { StructureStringAssertConfig } from '../types';
import { StructureAssertion } from './structure-assertion';

/**
 * Checks module specifiers on selected import tokens.
 */
export class ImportPathAssertion extends StructureAssertion<string | StructureStringAssertConfig> {
  public readonly key = 'importPath';

  protected evaluateNode(node: TraversalNode, value: string | StructureStringAssertConfig) {
    return this.stringExpectationFailures({
      node,
      actual: this.stringProperty(node, 'importPath'),
      value,
      label: 'importPath',
    });
  }
}
