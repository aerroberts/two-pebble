import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { glob } from 'tinyglobby';
import type {
  SerializedTraversalTree,
  TraversalCacheExpandContext,
  TraversalCacheInput,
  TraversalFileSnapshot,
  TraversalTreeFactory,
} from '../types';
import { sha256 } from '../utils/hash';
import { normalizeTraversalPath } from '../utils/path';

const CACHE_VERSION = 1;

export class TraversalCache {
  private tree?: SerializedTraversalTree;
  private readonly fileSnapshots = new Map<string, TraversalFileSnapshot>();
  private readonly rootPath: string;
  private readonly cacheDirectory: string;

  public constructor(input: TraversalCacheInput) {
    this.rootPath = normalizeTraversalPath(input.rootPath);
    this.cacheDirectory = input.cacheDirectory;
  }

  public async get() {
    const context = await this.context();
    return this.getForContext(context);
  }

  public async expand(factory: TraversalTreeFactory) {
    const context = await this.context();
    const existing = this.getForContext(context);
    if (existing) {
      return existing;
    }

    const tree = await factory(context);
    this.tree = tree;
    this.writeDiskTree(tree);
    return tree;
  }

  public invalidate(options: { disk?: boolean } = {}) {
    this.tree = undefined;
    this.fileSnapshots.clear();
    if (options.disk && existsSync(this.cacheDirectory)) {
      const prefix = `${sha256(resolve(this.rootPath))}-`;
      for (const entry of readdirSync(this.cacheDirectory)) {
        if (entry.startsWith(prefix)) {
          unlinkSync(join(this.cacheDirectory, entry));
        }
      }
    }
  }

  public readFile(path: string) {
    const existing = this.fileSnapshots.get(path);
    if (existing) {
      return existing;
    }

    const text = readFileSync(path, 'utf-8');
    const snapshot = { hash: sha256(text), text };
    this.fileSnapshots.set(path, snapshot);
    return snapshot;
  }

  private getForContext(context: TraversalCacheExpandContext) {
    if (this.tree?.rootHash === context.rootHash) {
      return this.tree;
    }

    const cached = this.readDiskTree(context.rootHash);
    if (cached) {
      this.tree = cached;
      return cached;
    }

    return undefined;
  }

  private async context(): Promise<TraversalCacheExpandContext> {
    const paths = (
      statSync(this.rootPath).isDirectory()
        ? await glob('**/*', {
            absolute: true,
            cwd: this.rootPath,
            dot: true,
            ignore: ['**/.git/**', '**/node_modules/**'],
            onlyFiles: false,
          })
        : [this.rootPath]
    ).map((path) => normalizeTraversalPath(path));
    const rootHash = this.rootHash(paths);
    return {
      paths,
      readFile: (path) => this.readFile(path),
      rootHash,
      rootPath: this.rootPath,
    };
  }

  private rootHash(paths: string[]) {
    const hash = paths
      .filter((path) => statSync(path).isFile())
      .sort()
      .map((path) => `${relative(this.rootPath, path)}:${this.readFile(path).hash}`)
      .join('\n');
    return sha256(hash);
  }

  private readDiskTree(rootHash: string) {
    const path = this.treeCachePath(rootHash);
    if (!existsSync(path)) {
      return undefined;
    }
    try {
      const tree = JSON.parse(readFileSync(path, 'utf-8')) as SerializedTraversalTree;
      return tree.version === CACHE_VERSION && tree.rootHash === rootHash && tree.rootPath === this.rootPath
        ? tree
        : undefined;
    } catch {
      return undefined;
    }
  }

  private writeDiskTree(tree: SerializedTraversalTree) {
    mkdirSync(this.cacheDirectory, { recursive: true });
    writeFileSync(this.treeCachePath(tree.rootHash), JSON.stringify(tree, null, 2));
  }

  private treeCachePath(rootHash: string) {
    const rootKey = sha256(resolve(this.rootPath));
    return join(this.cacheDirectory, `${rootKey}-${rootHash}.json`);
  }
}
