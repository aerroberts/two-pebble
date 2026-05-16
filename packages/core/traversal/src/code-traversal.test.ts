import { beforeEach, describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { basename, isAbsolute, resolve } from 'node:path';
import { CodeTraversal, TraversalCache, type TraversalTreeFactory } from '.';
import { codeTraversalTestSupport } from './code-traversal-test-support';

/**
 * Testing philosophy:
 * The tested code operates by taking in file tree of source files and exposing a clean
 * interface by which callers can traverse this tree and grab matching nodes.
 * The tests will demonstrate building a new traversal instance, and running find commands against
 * static test data, resulting in example snapshots saved to disk for inspection and
 * performing direct assertions about intended results
 */

/**
 * Exercises direct traversal queries against single-file AST fixtures.
 * Each test checks one contract so failures identify the broken behavior.
 */
describe('feature: code traversal', () => {
  let traversal: CodeTraversal;

  beforeEach(() => {
    traversal = new CodeTraversal({
      rootPath: codeTraversalTestSupport.snapshotRoot(),
      cacheDirectory: codeTraversalTestSupport.cacheDirectory(),
    });
  });

  test('happy: resolves exported class metadata', async () => {
    const classes = await traversal.find('commented.ts/export/class');
    const [node] = classes;

    expect({
      count: classes.length,
      endLine: node?.property('endLine'),
      name: node?.property('name'),
      startLine: node?.property('startLine'),
      type: node?.property('type'),
    }).toEqual({ count: 1, endLine: 14, name: 'ExampleService', startLine: 4, type: 'token:class' });
  });

  test('happy: exposes file source metadata', async () => {
    const [file] = await traversal.find('commented.ts');
    const path = String(file?.property('path'));

    expect({
      isAbsolute: isAbsolute(path),
      lines: file?.property('lines'),
      path,
    }).toEqual({ isAbsolute: true, lines: 19, path: codeTraversalTestSupport.commentedFile() });
  });

  test('happy: finds previous sibling comments', async () => {
    const [node] = await traversal.find('commented.ts/export/class');

    const previous = await node?.find('$prev-sibling');

    expect(previous?.map((item) => item.property('token'))).toEqual(['block-comment']);
  });

  test('happy: exposes import module specifiers', async () => {
    const imports = await traversal.find('module.ts/import');

    expect(imports.map((node) => node.property('importPath'))).toEqual(['node:fs/promises']);
  });

  test('happy: exposes stripped comment content', async () => {
    const comments = await traversal.find('commented.ts/block-comment');

    expect(comments.map((node) => node.property('commentContent'))).toEqual([
      'Creates an example service used by traversal snapshots.',
    ]);
  });

  test('happy: finds the first top-level node after imports', async () => {
    const [file] = await traversal.find('module.ts');

    const nodes = await file?.find('$after-imports');

    expect(nodes?.map((node) => [node.property('token'), node.property('name')])).toEqual([['export', 'export']]);
  });

  test('happy: finds inside the first top-level node after imports', async () => {
    const [file] = await traversal.find('module.ts');

    const constants = await file?.find('$after-imports/const');

    expect(constants?.map((node) => [node.property('token'), node.property('name')])).toEqual([['const', 'mode']]);
  });

  test('happy: finds selected siblings', async () => {
    const [node] = await traversal.find('commented.ts/export/class');

    const allowed = await node?.find('$siblings/export/class');

    expect(allowed?.map((item) => item.property('name'))).toEqual(['ExampleService']);
  });

  test('happy: inverts sibling selections', async () => {
    const [node] = await traversal.find('commented.ts/export/class');
    const allowed = await node?.find('$siblings/export/class');

    const inverted = await traversal.invertSiblings(allowed ?? []);

    expect(inverted.map((item) => item.property('token'))).toEqual(['block-comment', 'export']);
  });

  test('happy: classifies function kinds by function syntax', async () => {
    const nodes = await traversal.find('nested-functions.ts/**/function');
    const byName = new Map(nodes.map((node) => [node.property('name'), node.property('functionKind')]));

    expect(Object.fromEntries(byName)).toMatchObject({
      arrowInsideFunction: 'arrow',
      exportedArrow: 'arrow',
      inner: 'declaration',
      nestedArrow: 'arrow',
      outer: 'declaration',
    });
  });

  test('happy: exposes async flags by function syntax', async () => {
    const nodes = await traversal.find('nested-functions.ts/**/function');
    const byName = new Map(nodes.map((node) => [node.property('name'), node.property('async')]));

    expect(Object.fromEntries(byName)).toMatchObject({ asyncArrow: true, asyncOuter: true });
  });

  test('happy: exposes await expressions', async () => {
    const awaits = await traversal.find('nested-functions.ts/**/await');

    expect(awaits).toHaveLength(2);
  });

  test('happy: exposes destructured parameter trees', async () => {
    const [parameters] = await traversal.find('component.tsx/export/function/parameters');
    const nodes = await parameters?.find('parameter');
    const bindings = await parameters?.find('**/parameter-binding');

    expect({
      bindings: bindings?.map((node) => [node.property('name'), node.property('propertyName')]),
      nodes: nodes?.map((node) => ({
        destructured: node.property('destructured'),
        name: node.property('name'),
      })),
      wrapper: {
        name: parameters?.property('name'),
        type: parameters?.property('type'),
      },
    }).toEqual({
      bindings: [
        ['title', 'title'],
        ['children', 'children'],
      ],
      nodes: [{ destructured: true, name: '{ title, children }' }],
      wrapper: { name: 'parameters', type: 'token:parameters' },
    });
  });

  test('unhappy: throws when a property is not valid for the node type', async () => {
    const [node] = await traversal.find('commented.ts/export/class');

    expect(() => node?.property('fileName')).toThrow('Property fileName is not valid for token node ExampleService.');
  });

  for (const file of codeTraversalTestSupport.snapshotSourceFiles()) {
    test(`snapshot: translates ${basename(file)}`, async () => {
      const traversal = new CodeTraversal({
        rootPath: file,
        cacheDirectory: codeTraversalTestSupport.cacheDirectory(),
      });
      const rendered = JSON.stringify(await traversal.renderForSnapshot(), null, 2);
      const snapshot = readFileSync(`${file}.snapshot.json`, 'utf-8').trim();

      expect(rendered).toBe(snapshot);
    });
  }
});

/**
 * Locks complex find patterns against a directory-sized fixture corpus.
 * These snapshots make broad query semantics explicit and reviewable.
 */
describe('feature: traversal find snapshots', () => {
  for (const snapshot of codeTraversalTestSupport.findSnapshots) {
    test(`snapshot: find ${snapshot.name}`, async () => {
      const traversal = new CodeTraversal({
        rootPath: codeTraversalTestSupport.findCorpusRoot(),
        cacheDirectory: codeTraversalTestSupport.cacheDirectory(),
      });
      const nodes = await traversal.find(snapshot.query);
      const rendered = JSON.stringify(
        nodes.map((node) => codeTraversalTestSupport.nodeSummary(node)),
        null,
        2,
      );
      const expected = readFileSync(
        resolve(codeTraversalTestSupport.findSnapshotRoot(), `${snapshot.name}.json`),
        'utf-8',
      ).trim();

      expect(rendered).toBe(expected);
    });
  }
});

/**
 * Verifies traversal cache reuse and explicit invalidation behavior.
 * Cache tests guard the contract used by repeated structure queries.
 */
describe('feature: traversal cache', () => {
  test('happy: expands once and reuses the in-memory tree', async () => {
    const cache = new TraversalCache({
      rootPath: codeTraversalTestSupport.commentedFile(),
      cacheDirectory: codeTraversalTestSupport.cacheDirectory(),
    });
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
    const cache = new TraversalCache({
      rootPath: codeTraversalTestSupport.commentedFile(),
      cacheDirectory: codeTraversalTestSupport.cacheDirectory(),
    });
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
