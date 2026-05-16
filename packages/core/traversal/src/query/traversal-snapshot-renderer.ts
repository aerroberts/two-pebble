import type { TraversalSnapshotNode } from '../types';
import type { TraversalIndex } from './traversal-index';

export class TraversalSnapshotRenderer {
  public constructor(private readonly index: TraversalIndex) {}

  public render(rootId = this.index.rootId()): TraversalSnapshotNode {
    const record = this.index.record(rootId);
    return {
      kind: record.kind,
      name: record.name,
      async: record.async,
      destructured: record.destructured,
      token: record.token,
      commentContent: record.commentContent,
      functionKind: record.functionKind,
      importPath: record.importPath,
      propertyName: record.propertyName,
      line: record.line,
      startLine: record.startLine,
      startColumn: record.startColumn,
      endLine: record.endLine,
      endColumn: record.endColumn,
      children: record.childIds.map((childId) => this.render(childId)),
    };
  }
}
