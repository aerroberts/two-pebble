import { dirname, isAbsolute, join } from 'node:path';
import type { TraversalFindParts, TraversalNodeRecord } from '../types';
import { matchesGlob } from '../utils/glob';
import type { TraversalIndex } from './traversal-index';

export class TraversalFinder {
  public constructor(
    private readonly index: TraversalIndex,
    private readonly rootPath: string,
  ) {}

  public resolveRoot(query: string) {
    const parts = this.splitFind(query);
    const pathIds = this.matchPaths(parts.pathPattern);
    if (parts.syntaxPattern === undefined) {
      return pathIds;
    }

    return pathIds.flatMap((id) => this.resolveSyntax(id, parts.syntaxPattern ?? ''));
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
    if (query.includes('::')) {
      const parts = this.splitFind(query);
      const base = this.baseDirectoryFor(id);
      const pathIds = this.matchPaths(join(base, parts.pathPattern));
      return parts.syntaxPattern === undefined
        ? pathIds
        : pathIds.flatMap((nodeId) => this.resolveSyntax(nodeId, parts.syntaxPattern ?? ''));
    }

    return this.resolveSyntax(id, query);
  }

  private resolveSyntax(id: string, syntaxPattern: string) {
    return this.matchSegments([id], syntaxPattern.split('/').filter(Boolean));
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

  private matchPaths(pattern: string) {
    const normalized = isAbsolute(pattern) ? pattern : join(this.rootPath, pattern);
    return this.index
      .entries()
      .filter(([path]) => matchesGlob(path, normalized))
      .map(([, id]) => id);
  }

  private splitFind(find: string): TraversalFindParts {
    const [pathPattern, syntaxPattern] = find.split('::');
    return { pathPattern: pathPattern ?? '', syntaxPattern };
  }

  private previousSibling(id: string): string | undefined {
    const record = this.index.record(id);
    const parent = record.parentId ? this.index.record(record.parentId) : undefined;
    const siblings = parent?.childIds ?? [];
    const index = siblings.indexOf(id);
    if (index > 0) {
      return siblings[index - 1];
    }

    return parent?.token === 'export' ? this.previousSibling(parent.id) : undefined;
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
    return segment === '*' || record.token === segment || record.kind === segment || record.name === segment;
  }

  private baseDirectoryFor(id: string) {
    const record = this.index.record(id);
    if (record.kind === 'folder') {
      return record.path ?? this.rootPath;
    }
    return dirname(record.path ?? this.rootPath);
  }
}
