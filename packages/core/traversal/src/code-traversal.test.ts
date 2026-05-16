import { describe, expect, test } from 'bun:test';
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, isAbsolute, join, relative, resolve } from 'node:path';
import { CodeTraversal, TraversalCache, type TraversalTreeFactory } from '.';

const findSnapshots = [
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

function snapshotRoot() {
  return resolve(import.meta.dirname, '../resources/ast');
}

function commentedFile() {
  return resolve(snapshotRoot(), 'commented.ts');
}

function snapshotSourceFiles() {
  return readdirSync(snapshotRoot())
    .filter((file) => file.endsWith('.ts') || file.endsWith('.tsx'))
    .map((file) => resolve(snapshotRoot(), file))
    .sort();
}

function cacheDirectory() {
  return mkdtempSync(join(tmpdir(), 'two-pebble-traversal-'));
}

function resourceRoot() {
  return resolve(import.meta.dirname, '../resources/find-corpus');
}

function findSnapshotRoot() {
  return resolve(import.meta.dirname, '../resources/snapshots');
}

function optionalProperty(node: { property(name: string): unknown }, name: string) {
  try {
    return node.property(name);
  } catch {
    return undefined;
  }
}

function nodeSummary(node: { property(name: string): unknown }) {
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
    path: typeof path === 'string' ? relative(resourceRoot(), path) : undefined,
    line: optionalProperty(node, 'line'),
    startLine: optionalProperty(node, 'startLine'),
    endLine: optionalProperty(node, 'endLine'),
  };
}

describe('feature: code traversal', () => {
  test('happy: finds AST nodes and exposes typed properties', async () => {
    const traversal = new CodeTraversal({ rootPath: snapshotRoot(), cacheDirectory: cacheDirectory() });

    const classes = await traversal.find('commented.ts/export/class');
    expect(classes).toHaveLength(1);
    expect(classes[0]?.property('name')).toBe('ExampleService');
    expect(classes[0]?.property('type')).toBe('token:class');
    expect(isAbsolute(String(classes[0]?.property('path')))).toBe(true);
    expect(classes[0]?.property('path')).toBe(commentedFile());
    expect(classes[0]?.property('startLine')).toBe(4);
    expect(classes[0]?.property('endLine')).toBe(14);

    const [file] = await traversal.find('commented.ts');
    expect(file?.property('lines')).toBe(19);

    const previous = await classes[0]?.find('$prev-sibling');
    expect(previous?.map((node) => node.property('token'))).toEqual(['block-comment']);
  });

  test('happy: exposes import module specifiers', async () => {
    const traversal = new CodeTraversal({ rootPath: snapshotRoot(), cacheDirectory: cacheDirectory() });

    const imports = await traversal.find('module.ts/import');

    expect(imports.map((node) => node.property('importPath'))).toEqual(['node:fs/promises']);
  });

  test('happy: exposes stripped comment content', async () => {
    const traversal = new CodeTraversal({ rootPath: snapshotRoot(), cacheDirectory: cacheDirectory() });

    const comments = await traversal.find('commented.ts/block-comment');

    expect(comments.map((node) => node.property('commentContent'))).toEqual([
      'Creates an example service used by traversal snapshots.',
    ]);
  });

  test('happy: finds siblings and inverted sibling groups', async () => {
    const traversal = new CodeTraversal({ rootPath: snapshotRoot(), cacheDirectory: cacheDirectory() });
    const [exportedClass] = await traversal.find('commented.ts/export/class');
    const allowed = await exportedClass?.find('$siblings/export/class');
    const inverted = await traversal.invertSiblings(allowed ?? []);

    expect(allowed?.map((node) => node.property('name'))).toEqual(['ExampleService']);
    expect(inverted.map((node) => node.property('token'))).toEqual(['block-comment', 'export']);
  });

  test('happy: distinguishes arrow functions from declarations', async () => {
    const traversal = new CodeTraversal({ rootPath: snapshotRoot(), cacheDirectory: cacheDirectory() });

    const functions = await traversal.find('nested-functions.ts/**/function');
    const byName = new Map(functions.map((node) => [node.property('name'), node.property('functionKind')]));

    expect(byName.get('outer')).toBe('declaration');
    expect(byName.get('inner')).toBe('declaration');
    expect(byName.get('arrowInsideFunction')).toBe('arrow');
    expect(byName.get('nestedArrow')).toBe('arrow');
    expect(byName.get('exportedArrow')).toBe('arrow');
  });

  test('happy: exposes async functions and await expressions', async () => {
    const traversal = new CodeTraversal({ rootPath: snapshotRoot(), cacheDirectory: cacheDirectory() });

    const functions = await traversal.find('nested-functions.ts/**/function');
    const asyncByName = new Map(functions.map((node) => [node.property('name'), node.property('async')]));
    const awaits = await traversal.find('nested-functions.ts/**/await');

    expect(asyncByName.get('asyncOuter')).toBe(true);
    expect(asyncByName.get('asyncArrow')).toBe(true);
    expect(awaits).toHaveLength(2);
  });

  test('happy: exposes a parameters node with one child per parameter', async () => {
    const traversal = new CodeTraversal({ rootPath: snapshotRoot(), cacheDirectory: cacheDirectory() });

    const [parameters] = await traversal.find('component.tsx/export/function/parameters');
    const parameterNodes = await parameters?.find('parameter');
    const bindings = await parameters?.find('**/parameter-binding');

    expect(parameters?.property('name')).toBe('parameters');
    expect(parameters?.property('type')).toBe('token:parameters');
    expect(parameterNodes?.map((node) => node.property('name'))).toEqual(['{ title, children }']);
    expect(parameterNodes?.map((node) => node.property('destructured'))).toEqual([true]);
    expect(bindings?.map((node) => [node.property('name'), node.property('propertyName')])).toEqual([
      ['title', 'title'],
      ['children', 'children'],
    ]);
  });

  test('unhappy: throws when a property is not valid for the node type', async () => {
    const traversal = new CodeTraversal({ rootPath: snapshotRoot(), cacheDirectory: cacheDirectory() });
    const [node] = await traversal.find('commented.ts/export/class');

    expect(() => node?.property('fileName')).toThrow('Property fileName is not valid for token node ExampleService.');
  });

  for (const file of snapshotSourceFiles()) {
    test(`snapshot: translates ${basename(file)}`, async () => {
      const traversal = new CodeTraversal({ rootPath: file, cacheDirectory: cacheDirectory() });
      const rendered = JSON.stringify(await traversal.renderForSnapshot(), null, 2);
      const snapshot = readFileSync(`${file}.snapshot.json`, 'utf-8').trim();

      expect(rendered).toBe(snapshot);
    });
  }
});

describe('feature: traversal find snapshots', () => {
  for (const snapshot of findSnapshots) {
    test(`snapshot: find ${snapshot.name}`, async () => {
      const traversal = new CodeTraversal({ rootPath: resourceRoot(), cacheDirectory: cacheDirectory() });
      const nodes = await traversal.find(snapshot.query);
      const rendered = JSON.stringify(nodes.map(nodeSummary), null, 2);
      const expected = readFileSync(resolve(findSnapshotRoot(), `${snapshot.name}.json`), 'utf-8').trim();

      expect(rendered).toBe(expected);
    });
  }
});

describe('feature: traversal cache', () => {
  test('happy: expands once and reuses the in-memory tree', async () => {
    const cache = new TraversalCache({ rootPath: commentedFile(), cacheDirectory: cacheDirectory() });
    let calls = 0;
    const factory: TraversalTreeFactory = async (context) => {
      calls += 1;
      return {
        version: 1,
        rootHash: context.rootHash,
        rootId: 'node:0',
        rootPath: context.rootPath,
        pathIds: [[context.rootPath, 'node:0']],
        records: [{ id: 'node:0', kind: 'folder', name: 'pass', path: context.rootPath, childIds: [] }],
      };
    };

    await cache.expand(factory);
    await cache.expand(factory);

    expect(calls).toBe(1);
  });

  test('happy: invalidates in-memory cache and expands again', async () => {
    const cache = new TraversalCache({ rootPath: commentedFile(), cacheDirectory: cacheDirectory() });
    let calls = 0;
    const factory: TraversalTreeFactory = async (context) => {
      calls += 1;
      return {
        version: 1,
        rootHash: context.rootHash,
        rootId: 'node:0',
        rootPath: context.rootPath,
        pathIds: [[context.rootPath, 'node:0']],
        records: [{ id: 'node:0', kind: 'folder', name: 'pass', path: context.rootPath, childIds: [] }],
      };
    };

    await cache.expand(factory);
    cache.invalidate({ disk: true });
    await cache.expand(factory);

    expect(calls).toBe(2);
  });
});
