import type { CodeTraversal } from './code-traversal';
import type { TraversalPropertyValue } from './types';

/**
 * Public handle for one traversal node.
 * It exposes no parent or child object graph.
 * Further lookups always go through the owning traversal.
 */
export class TraversalNode {
  public constructor(
    private readonly traversal: CodeTraversal,
    private readonly id: string,
  ) {}

  /**
   * Finds nodes relative to this node.
   * The owning traversal resolves the query against its cached tree.
   * Results are new public node handles.
   */
  public async find(query: string) {
    return this.traversal.findFrom(this.id, query);
  }

  /**
   * Reads a property that is valid for this node kind.
   * Invalid properties throw to keep callers honest.
   * Values are copied from the cached immutable record.
   */
  public property(name: string): TraversalPropertyValue {
    return this.traversal.property(this.id, name);
  }

  /**
   * Returns an internal id used only by traversal tests.
   * The id is stable within one traversal instance.
   * Consumers should prefer query and property APIs.
   */
  public debugId() {
    return this.id;
  }
}
