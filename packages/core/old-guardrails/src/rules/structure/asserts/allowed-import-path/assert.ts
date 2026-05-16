import type { TraversalNode } from '@two-pebble/traversal';
import { StructureAssertion } from '../../structure-assertion';

/**
 * Checks import and re-export specifiers against an allow-list.
 * Entries allow exact matches and subpaths.
 */
export class Assert extends StructureAssertion<string[]> {
  public readonly key = 'allowedImportPath';

  /**
   * Empty import groups are valid because files may not import anything.
   */
  protected evaluateEmpty() {
    return [];
  }

  protected evaluateNode(node: TraversalNode, value: string[]) {
    const importPath = this.stringProperty(node, 'importPath');
    return value.some((allowed) => importPath === allowed || importPath.startsWith(`${allowed}/`))
      ? []
      : [this.failure(node, `Expected importPath ${importPath} to be allowed.`)];
  }
}
