import type { TraversalNodeRecord } from '../types';
import { matchesGlob } from '../utils/glob';
import type { TraversalIndex } from './traversal-index';

export class TraversalFinder {
  public constructor(private readonly index: TraversalIndex) {}

  public resolveRoot(query: string) {
    return this.resolveSyntax(this.index.rootId(), query);
  }

  public resolveFrom(id: string, query: string) {
    if (query === '$prev-sibling') {
      const sibling = this.previousSibling(id);
      return sibling ? [sibling] : [];
    }
    if (query.startsWith('$prev-sibling/')) {
      const sibling = this.previousSibling(id);
      return sibling ? this.resolveSyntax(sibling, query.slice('$prev-sibling/'.length)) : [];
    }
    if (query === '$siblings') {
      return this.siblings(id);
    }
    if (query.startsWith('$siblings/')) {
      return this.matchCurrentSegments(this.siblings(id), this.segments(query.slice('$siblings/'.length)));
    }
    return this.resolveSyntax(id, query);
  }

  public invertSiblings(ids: string[]) {
    const originals = new Set(ids.map((id) => this.siblingGroupMemberId(id)));
    const parentIds = new Set(
      [...originals].flatMap((id) => {
        const parentId = this.index.record(id).parentId;
        return parentId ? [parentId] : [];
      }),
    );
    return [...parentIds].flatMap((parentId) => {
      return this.index.record(parentId).childIds.filter((childId) => !originals.has(childId));
    });
  }

  private resolveSyntax(id: string, syntaxPattern: string) {
    return this.matchSegments([id], this.segments(syntaxPattern));
  }

  private matchSegments(ids: string[], segments: string[]): string[] {
    if (segments.length === 0) {
      return ids;
    }

    const [segment, ...rest] = segments;
    if (segment === '**') {
      const candidates = ids.flatMap((id) => [id, ...this.descendantIds(id)]);
      return this.matchSegments(candidates, rest);
    }

    const candidates = ids
      .flatMap((id) => this.index.record(id).childIds)
      .filter((childId) => {
        return this.matchesSegment(this.index.record(childId), segment ?? '');
      });
    return this.matchSegments(candidates, rest);
  }

  private matchCurrentSegments(ids: string[], segments: string[]): string[] {
    if (segments.length === 0) {
      return ids;
    }

    const [segment, ...rest] = segments;
    if (segment === '**') {
      const candidates = ids.flatMap((id) => [id, ...this.descendantIds(id)]);
      return this.matchCurrentSegments(candidates, rest);
    }

    const candidates = ids.filter((id) => this.matchesSegment(this.index.record(id), segment ?? ''));
    return this.matchSegments(candidates, rest);
  }

  private previousSibling(id: string): string | undefined {
    const record = this.index.record(this.siblingGroupMemberId(id));
    const parent = record.parentId ? this.index.record(record.parentId) : undefined;
    const siblings = parent?.childIds ?? [];
    const siblingIndex = siblings.indexOf(record.id);
    if (siblingIndex > 0) {
      return siblings[siblingIndex - 1];
    }

    return parent && this.unwrapPreviousSibling(parent) ? this.previousSibling(parent.id) : undefined;
  }

  private siblings(id: string) {
    const record = this.index.record(this.siblingGroupMemberId(id));
    const parent = record.parentId ? this.index.record(record.parentId) : undefined;
    return parent?.childIds ?? [];
  }

  private siblingGroupMemberId(id: string): string {
    let record = this.index.record(id);
    while (record.parentId) {
      const parent = this.index.record(record.parentId);
      if (!this.unwrapPreviousSibling(parent)) {
        break;
      }
      record = parent;
    }
    return record.id;
  }

  private unwrapPreviousSibling(record: TraversalNodeRecord | undefined) {
    return (
      record?.token === 'export' ||
      record?.token === 'private' ||
      record?.token === 'protected' ||
      record?.token === 'public' ||
      record?.token === 'static'
    );
  }

  private descendantIds(id: string) {
    const ids: string[] = [];
    const visit = (nodeId: string) => {
      for (const childId of this.index.record(nodeId).childIds) {
        ids.push(childId);
        visit(childId);
      }
    };
    visit(id);
    return ids;
  }

  private matchesSegment(record: TraversalNodeRecord, segment: string) {
    return (
      segment === '*' ||
      record.token === segment ||
      record.kind === segment ||
      record.name === segment ||
      matchesGlob(record.name, segment)
    );
  }

  private segments(query: string) {
    return this.normalizeRelativeQuery(query).split('/').filter(Boolean);
  }

  private normalizeRelativeQuery(query: string) {
    return query.replace(/^\.\//, '');
  }
}
