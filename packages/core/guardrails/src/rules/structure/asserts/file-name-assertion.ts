import type { TraversalNode } from '@two-pebble/traversal';
import type { StructureFileNameAssertConfig } from '../types';
import { StructureAssertion } from './structure-assertion';

/**
 * Checks file name constraints against selected file nodes.
 * String values are treated as exact file-name matches.
 * Object values can check prefixes, suffixes, or equality.
 */
export class FileNameAssertion extends StructureAssertion<string | StructureFileNameAssertConfig> {
  public readonly key = 'fileName';

  protected evaluateNode(node: TraversalNode, value: string | StructureFileNameAssertConfig) {
    if (node.property('kind') !== 'file') {
      return [this.failure(node, 'fileName can only be asserted against file nodes.')];
    }

    const fileName = this.stringProperty(node, 'fileName');
    const config = typeof value === 'string' ? { equals: value } : value;
    if (config.equals !== undefined && fileName !== config.equals) {
      return [this.failure(node, `Expected file name ${config.equals}.`)];
    }
    if (config.endsWith !== undefined && !fileName.endsWith(config.endsWith)) {
      return [this.failure(node, `Expected file name to end with ${config.endsWith}.`)];
    }
    if (config.startsWith !== undefined && !fileName.startsWith(config.startsWith)) {
      return [this.failure(node, `Expected file name to start with ${config.startsWith}.`)];
    }

    return [];
  }
}
