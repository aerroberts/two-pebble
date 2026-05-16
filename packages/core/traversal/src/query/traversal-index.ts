import type { SerializedTraversalTree, TraversalNodeRecord } from '../types';

export class TraversalIndex {
  private readonly records = new Map<string, TraversalNodeRecord>();
  private readonly pathIds = new Map<string, string>();

  public constructor(private readonly tree: SerializedTraversalTree) {
    for (const record of tree.records) {
      this.records.set(record.id, record);
    }
    for (const [path, id] of tree.pathIds) {
      this.pathIds.set(path, id);
    }
  }

  public entries() {
    return [...this.pathIds.entries()];
  }

  public record(id: string) {
    const record = this.records.get(id);
    if (!record) {
      throw new Error(`Unknown traversal node: ${id}`);
    }
    return record;
  }

  public rootId() {
    return this.tree.rootId;
  }
}
