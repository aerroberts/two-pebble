import type ts from 'typescript';

export type TraversalNodeKind = 'empty-set' | 'file' | 'folder' | 'root' | 'token';

export type TraversalTokenName =
  | 'accessor'
  | 'await'
  | 'block'
  | 'block-comment'
  | 'class'
  | 'catch'
  | 'const'
  | 'constructor'
  | 'export'
  | 'function'
  | 'import'
  | 'interface'
  | 'if'
  | 'line-comment'
  | 'parameter'
  | 'parameter-binding'
  | 'parameters'
  | 'private'
  | 'protected'
  | 'public'
  | 'static'
  | 'try';

export type TraversalNodeType = 'file' | 'folder' | `token:${TraversalTokenName}`;

export type TraversalFunctionKind = 'arrow' | 'declaration' | 'expression' | 'method';

export type TraversalPropertyName =
  | 'async'
  | 'children'
  | 'commentContent'
  | 'destructured'
  | 'end'
  | 'endColumn'
  | 'endLine'
  | 'fileName'
  | 'functionKind'
  | 'importPath'
  | 'kind'
  | 'line'
  | 'lines'
  | 'name'
  | 'path'
  | 'propertyName'
  | 'start'
  | 'startColumn'
  | 'startLine'
  | 'text'
  | 'token'
  | 'type';

export type TraversalPropertyValue = boolean | number | string | string[] | undefined;

export interface CodeTraversalInput {
  rootPath: string;
  cacheDirectory?: string;
  cache?: TraversalCacheLike;
}

export interface TraversalCacheInput {
  rootPath: string;
  cacheDirectory: string;
}

export interface TraversalCacheLike {
  get(): Promise<SerializedTraversalTree | undefined>;
  expand(factory: TraversalTreeFactory): Promise<SerializedTraversalTree>;
  invalidate(options?: { disk?: boolean }): void;
}

export type TraversalTreeFactory = (context: TraversalCacheExpandContext) => Promise<SerializedTraversalTree>;

export interface TraversalCacheExpandContext {
  rootPath: string;
  rootHash: string;
  paths: string[];
  readFile: (path: string) => TraversalFileSnapshot;
}

export interface TraversalNodeRecord {
  id: string;
  kind: TraversalNodeKind;
  name: string;
  parentId?: string;
  async?: boolean;
  destructured?: boolean;
  path?: string;
  commentContent?: string;
  functionKind?: TraversalFunctionKind;
  importPath?: string;
  propertyName?: string;
  token?: TraversalTokenName;
  text?: string;
  line?: number;
  startLine?: number;
  startColumn?: number;
  endLine?: number;
  endColumn?: number;
  start?: number;
  end?: number;
  childIds: string[];
}

export interface SerializedTraversalTree {
  version: number;
  rootPath: string;
  rootHash: string;
  rootId: string;
  records: TraversalNodeRecord[];
  pathIds: [string, string][];
}

export interface TraversalFileSnapshot {
  hash: string;
  text: string;
}

export interface TraversalTokenNodeInput {
  sourceFile: ts.SourceFile;
  node: ts.Node;
  token: TraversalTokenName;
  name: string;
  async?: boolean;
  destructured?: boolean;
  end?: number;
  functionKind?: TraversalFunctionKind;
  importPath?: string;
  propertyName?: string;
  start?: number;
  childIds: string[];
}

export interface TraversalSnapshotNode {
  kind: TraversalNodeKind;
  name: string;
  async?: boolean;
  destructured?: boolean;
  token?: TraversalTokenName;
  commentContent?: string;
  functionKind?: TraversalFunctionKind;
  importPath?: string;
  propertyName?: string;
  line?: number;
  startLine?: number;
  startColumn?: number;
  endLine?: number;
  endColumn?: number;
  children: TraversalSnapshotNode[];
}
