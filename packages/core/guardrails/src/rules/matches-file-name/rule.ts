import { basename } from 'node:path';
import type { TraversalNode } from '@two-pebble/traversal';
import { StructureRule } from '../structure-rule';

/**
 * Checks that a token name maps to its file stem.
 * The token name is converted to dash case before comparing.
 * File extensions are ignored so the assertion works for .ts and .tsx.
 */
export class Rule extends StructureRule<boolean> {
  public readonly key = 'matchesFileName';

  protected evaluateEmpty() {
    return [];
  }

  protected evaluateNode(node: TraversalNode, value: boolean) {
    if (!value) {
      return [];
    }

    if (node.property('kind') !== 'token') {
      return [this.failure(node, 'matchesFileName can only be asserted against token nodes.')];
    }

    const name = this.stringProperty(node, 'name');
    const path = this.stringProperty(node, 'path');
    const expected = this.toDashCase(name);
    const actual = this.fileStem(path);

    return actual === expected ? [] : [this.failure(node, `Expected token ${name} to match file name ${expected}.`)];
  }

  private fileStem(path: string) {
    return basename(path).replace(/\.[^.]+$/, '');
  }

  private toDashCase(value: string) {
    return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }
}
