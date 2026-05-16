import type { WorkspaceNode } from './ast/workspace-node';

/**
 * A set of traversal nodes representing the result of a traversal query
 */
export class TraversalResultSet {
  private readonly nodes: Record<string, WorkspaceNode>;
  private readonly idSet: Set<string>;

  /**
   * Creates a result set and adds initial nodes with stable de-duplication.
   */
  public constructor() {
    this.nodes = {};
    this.idSet = new Set();
  }

  public get length() {
    return Object.keys(this.nodes).length;
  }

  /**
   * Adds a node when the result set does not already contain its id.
   */
  public add(node: WorkspaceNode) {
    if (!this.idSet.has(node.id)) {
      this.nodes[node.id] = node;
      this.idSet.add(node.id);
    }
    return this;
  }

  /**
   * Runs a side-effect callback for each result node.
   */
  public forEach(handler: (node: WorkspaceNode, index: number) => void) {
    Object.values(this.nodes).forEach(handler);
  }

  /**
   * Adds every node from another result set into this result set.
   */
  public merge(set: TraversalResultSet) {
    for (const node of Object.values(set.nodes)) {
      this.add(node);
    }
    return this;
  }
}
