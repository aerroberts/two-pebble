import type { TraversalNode } from '@two-pebble/traversal';
import { StructureRule } from '../structure-rule';

/**
 * Checks the structural type of each selected node.
 * Files, folders, and translated AST tokens share one type namespace.
 * Token checks use the token:name form from code.guard.
 */
export class Rule extends StructureRule<string> {
  public readonly key = 'type';

  protected evaluateNode(node: TraversalNode, value: string) {
    const type = node.property('type');
    return type === value ? [] : [this.failure(node, `Expected ${value}, found ${String(type)}.`)];
  }
}
