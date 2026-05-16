import { statSync } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';
import { TraversalCache } from './cache/traversal-cache';
import { TraversalFinder } from './query/traversal-finder';
import { TraversalIndex } from './query/traversal-index';
import { TraversalProperties } from './query/traversal-properties';
import { TraversalSnapshotRenderer } from './query/traversal-snapshot-renderer';
import { TraversalNode } from './traversal-node';
import { TraversalTreeBuilder } from './tree/traversal-tree-builder';
import type { CodeTraversalInput, TraversalCacheLike, TraversalPropertyValue } from './types';
import { normalizeTraversalPath } from './utils/path';

/**
 * Provides cached filesystem and AST lookup operations for one absolute root path.
 */
export class CodeTraversal {
  private readonly rootPath: string;
  private readonly cache: TraversalCacheLike;
  private readonly properties = new TraversalProperties();
  private index?: TraversalIndex;

  public constructor(input: string | CodeTraversalInput) {
    const rootPath = typeof input === 'string' ? input : input.rootPath;
    if (!isAbsolute(rootPath)) {
      throw new Error(`CodeTraversal requires an absolute path: ${rootPath}`);
    }

    this.rootPath = normalizeTraversalPath(rootPath);
    this.cache =
      typeof input === 'string'
        ? this.defaultCache(this.rootPath)
        : (input.cache ?? this.defaultCache(this.rootPath, input.cacheDirectory));
  }

  public async find(query: string) {
    const index = await this.ensureIndex();
    return new TraversalFinder(index).resolveRoot(query).map((id) => this.node(id));
  }

  public async invertSiblings(nodes: TraversalNode[]) {
    const index = await this.ensureIndex();
    return new TraversalFinder(index).invertSiblings(nodes.map((node) => node.debugId())).map((id) => this.node(id));
  }

  public async findFrom(id: string, query: string) {
    const index = await this.ensureIndex();
    return new TraversalFinder(index).resolveFrom(id, query).map((nodeId) => this.node(nodeId));
  }

  public invalidate(options?: { disk?: boolean }) {
    this.index = undefined;
    this.cache.invalidate(options);
  }

  public property(id: string, name: string): TraversalPropertyValue {
    if (!this.index) {
      throw new Error('Traversal properties are only available after find has loaded the tree.');
    }

    return this.properties.read(this.index.record(id), name);
  }

  public async renderForSnapshot() {
    const index = await this.ensureIndex();
    return new TraversalSnapshotRenderer(index).render();
  }

  private async ensureIndex() {
    if (this.index) {
      return this.index;
    }

    const tree = await this.cache.expand((context) => new TraversalTreeBuilder(context).build());
    this.index = new TraversalIndex(tree);
    return this.index;
  }

  private defaultCache(
    rootPath: string,
    cacheDirectory = join(this.cacheRoot(rootPath), 'node_modules', '.cache', 'two-pebble-traversal'),
  ) {
    return new TraversalCache({ rootPath, cacheDirectory });
  }

  private cacheRoot(rootPath: string) {
    return statSync(rootPath).isDirectory() ? rootPath : dirname(rootPath);
  }

  private node(id: string) {
    return new TraversalNode(this, id);
  }
}
