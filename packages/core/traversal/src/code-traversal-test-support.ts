import { mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

export const findSnapshots = [
  { name: 'all-src-paths', query: 'src/**/*' },
  { name: 'typescript-files', query: 'src/**/*.ts' },
  { name: 'tsx-files', query: 'src/**/*.tsx' },
  { name: 'imports', query: 'src/**/import' },
  { name: 'comments', query: 'src/**/block-comment' },
  { name: 'awaits', query: 'src/**/await' },
  { name: 'parameter-bindings', query: 'src/**/*.tsx/**/parameter-binding' },
  { name: 'exported-ts-functions', query: 'src/**/*.ts/export/function' },
  { name: 'exported-ts-interfaces', query: 'src/**/*.ts/export/interface' },
  { name: 'exported-tsx-interfaces', query: 'src/**/*.tsx/export/interface' },
  { name: 'service-class-methods', query: 'src/services/**/*.ts/export/class/**/function' },
  { name: 'service-public-methods', query: 'src/services/**/*.ts/export/class/public/function' },
  { name: 'service-private-methods', query: 'src/services/**/*.ts/export/class/private/function' },
  { name: 'service-static-members', query: 'src/services/**/*.ts/export/class/**/static' },
  { name: 'service-constructors', query: 'src/services/**/*.ts/export/class/**/constructor' },
  { name: 'control-flow-if', query: 'src/**/*.ts/**/if' },
  { name: 'control-flow-try', query: 'src/**/*.ts/**/try' },
  { name: 'control-flow-catch', query: 'src/**/*.ts/**/catch' },
] as const;

export function snapshotRoot() {
  return resolve(import.meta.dirname, '../resources/ast');
}

export function commentedFile() {
  return resolve(snapshotRoot(), 'commented.ts');
}

export function snapshotSourceFiles() {
  return readdirSync(snapshotRoot())
    .filter((file) => file.endsWith('.ts') || file.endsWith('.tsx'))
    .map((file) => resolve(snapshotRoot(), file))
    .sort();
}

export function cacheDirectory() {
  return mkdtempSync(join(tmpdir(), 'two-pebble-traversal-'));
}

export function findSnapshotRoot() {
  return resolve(import.meta.dirname, '../resources/snapshots');
}

export function findCorpusRoot() {
  return resolve(import.meta.dirname, '../resources/find-corpus');
}

export function nodeSummary(node: { property(name: string): unknown }) {
  const path = optionalProperty(node, 'path');
  return {
    type: node.property('type'),
    name: node.property('name'),
    async: optionalProperty(node, 'async'),
    token: optionalProperty(node, 'token'),
    commentContent: optionalProperty(node, 'commentContent'),
    destructured: optionalProperty(node, 'destructured'),
    functionKind: optionalProperty(node, 'functionKind'),
    importPath: optionalProperty(node, 'importPath'),
    propertyName: optionalProperty(node, 'propertyName'),
    path: typeof path === 'string' ? relative(findCorpusRoot(), path) : undefined,
    line: optionalProperty(node, 'line'),
    startLine: optionalProperty(node, 'startLine'),
    endLine: optionalProperty(node, 'endLine'),
  };
}

function optionalProperty(node: { property(name: string): unknown }, name: string) {
  try {
    return node.property(name);
  } catch {
    return undefined;
  }
}
