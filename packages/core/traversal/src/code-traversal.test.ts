import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import type { WorkspaceNode } from './ast/workspace-node';
import { CodeTraversal } from './code-traversal';
import type { TraversalResultSet } from './result-set';

/**
 * Testing philosophy:
 * The tested code takes a multi-file TypeScript fixture and exposes a glob+AST
 * find interface. The tests build a CodeTraversal rooted at the fixture and run
 * representative queries, asserting both the shape of the result set and the
 * data on selected nodes.
 */

const fixtureRoot = resolve(import.meta.dirname, '../testing-resources/sample-project');
const srcGlob = `${fixtureRoot}/src/**/*.ts`;
const testGlob = `${fixtureRoot}/tests/**/*.test.ts`;

function toArray(results: TraversalResultSet): WorkspaceNode[] {
  const collected: WorkspaceNode[] = [];
  results.forEach((node) => {
    collected.push(node);
  });
  return collected;
}

describe('feature: code traversal find', () => {
  test('happy: globs every typescript file in the fixture project', async () => {
    const traversal = new CodeTraversal(fixtureRoot);

    const results = await traversal.find(srcGlob);
    const types = new Set(toArray(results).map((node) => node.type));

    expect(results.length).toBe(7);
    expect(types).toEqual(new Set(['file']));
  });

  test('happy: returns import nodes with module specifier metadata', async () => {
    const traversal = new CodeTraversal(fixtureRoot);

    const results = await traversal.find(`${srcGlob}#import`);
    const importSources = toArray(results)
      .map((node) => node.getProperty('importingFrom').trim())
      .sort();

    expect(importSources).toEqual([
      "'../types/user-record'",
      "'node:crypto'",
      "'node:fs/promises'",
      "'node:fs/promises'",
      "'node:util'",
    ]);
  });

  test('happy: finds exported classes across folders', async () => {
    const traversal = new CodeTraversal(fixtureRoot);

    const results = await traversal.find(`${srcGlob}#export/class`);
    const classNames = toArray(results)
      .map((node) => node.getProperty('name'))
      .sort();

    expect(classNames).toEqual(['SessionService', 'UserService']);
  });

  test('happy: finds exported functions including const-bound arrows', async () => {
    const traversal = new CodeTraversal(fixtureRoot);

    const directResults = await traversal.find(`${srcGlob}#export/function`);
    const constResults = await traversal.find(`${srcGlob}#export/const/function`);
    const names = [...toArray(directResults), ...toArray(constResults)].map((node) => node.getProperty('name')).sort();

    expect(names).toEqual(['formatDebug', 'formatLabel', 'loadJson']);
  });

  test('happy: finds exported interfaces and type aliases', async () => {
    const traversal = new CodeTraversal(fixtureRoot);

    const interfaces = await traversal.find(`${srcGlob}#export/interface`);
    const types = await traversal.find(`${srcGlob}#export/type`);
    const interfaceNames = toArray(interfaces)
      .map((node) => node.getProperty('name'))
      .sort();
    const typeNames = toArray(types).map((node) => node.getProperty('name'));

    expect({ interfaceNames, typeNames }).toEqual({
      interfaceNames: ['UserRecord', 'UserServiceOptions'],
      typeNames: ['UserId'],
    });
  });

  test('happy: walks into class members through public and private modifiers', async () => {
    const traversal = new CodeTraversal(fixtureRoot);

    const publicMethods = await traversal.find(`${srcGlob}#export/class/public/function`);
    const privateMethods = await traversal.find(`${srcGlob}#export/class/private/function`);
    const publicNames = toArray(publicMethods)
      .map((node) => node.getProperty('name'))
      .sort();
    const privateNames = toArray(privateMethods)
      .map((node) => node.getProperty('name'))
      .sort();

    expect({ publicNames, privateNames }).toEqual({
      publicNames: ['describe', 'load', 'start'],
      privateNames: ['normalize'],
    });
  });

  test('happy: finds static class members', async () => {
    const traversal = new CodeTraversal(fixtureRoot);

    const results = await traversal.find(`${srcGlob}#export/class/public/static/function`);
    const names = toArray(results).map((node) => node.getProperty('name'));

    expect(names).toEqual(['create']);
  });

  test('happy: finds class constructors', async () => {
    const traversal = new CodeTraversal(fixtureRoot);

    const results = await traversal.find(`${srcGlob}#export/class/public/constructor`);

    expect(results.length).toBe(1);
  });

  test('happy: exposes function parameter trees', async () => {
    const traversal = new CodeTraversal(fixtureRoot);

    const parameters = await traversal.find(`${srcGlob}#export/function/parameters/parameter`);
    const names = toArray(parameters)
      .map((node) => node.getProperty('name'))
      .sort();

    expect(names).toEqual(['path', 'value']);
  });

  test('happy: surfaces await expressions inside async functions', async () => {
    const traversal = new CodeTraversal(fixtureRoot);

    const results = await traversal.find(`${srcGlob}#export/function/block/await`);

    expect(results.length).toBe(1);
  });

  test('happy: marks async functions on the function node', async () => {
    const traversal = new CodeTraversal(fixtureRoot);

    const results = await traversal.find(`${srcGlob}#export/function`);
    const byName = new Map(toArray(results).map((node) => [node.getProperty('name'), node.getProperty('async')]));

    expect(Object.fromEntries(byName)).toMatchObject({
      formatLabel: 'false',
      loadJson: 'true',
    });
  });

  test('happy: matches any single segment via a star wildcard', async () => {
    const traversal = new CodeTraversal(fixtureRoot);

    const results = await traversal.find(`${srcGlob}#export/*`);
    const tokens = toArray(results)
      .map((node) => node.type)
      .sort();

    expect(tokens).toEqual([
      'class',
      'class',
      'const',
      'const',
      'function',
      'function',
      'interface',
      'interface',
      'type',
    ]);
  });

  test('happy: combines wildcard with deeper segments', async () => {
    const traversal = new CodeTraversal(fixtureRoot);

    const results = await traversal.find(`${srcGlob}#export/class/*/function`);
    const names = toArray(results)
      .map((node) => node.getProperty('name'))
      .sort();

    expect(names).toEqual(['describe', 'load', 'normalize', 'start']);
  });

  test('happy: $before modifier finds the sibling immediately preceding a class', async () => {
    const traversal = new CodeTraversal(fixtureRoot);

    const results = await traversal.find(`${fixtureRoot}/src/**/siblings.ts#class$before`);
    const summary = toArray(results).map((node) => ({ type: node.type, name: node.getProperty('name') }));

    expect(summary).toEqual([{ type: 'function', name: 'siblingHelper' }]);
  });

  test('happy: $before modifier works with wildcard next-sibling type', async () => {
    const traversal = new CodeTraversal(fixtureRoot);

    const results = await traversal.find(`${fixtureRoot}/src/**/siblings.ts#*$before`);
    const tokens = toArray(results)
      .map((node) => node.type)
      .sort();

    expect(tokens).toEqual(['class', 'const', 'function']);
  });

  test('happy: accepts an array of queries and merges their results', async () => {
    const traversal = new CodeTraversal(fixtureRoot);

    const results = await traversal.find([`${srcGlob}#export/class`, `${srcGlob}#export/interface`]);
    const summary = toArray(results)
      .map((node) => `${node.type}:${node.getProperty('name')}`)
      .sort();

    expect(summary).toEqual([
      'class:SessionService',
      'class:UserService',
      'interface:UserRecord',
      'interface:UserServiceOptions',
    ]);
  });

  test('happy: exposes describe and test title metadata', async () => {
    const traversal = new CodeTraversal(fixtureRoot);

    const describes = await traversal.find(`${testGlob}#describe`);
    const tests = await traversal.find(`${testGlob}#**/test`);
    const describeNames = toArray(describes).map((node) => node.getProperty('name'));
    const testNames = toArray(tests)
      .map((node) => `${node.getProperty('callName')}:${node.getProperty('name')}`)
      .sort();

    expect(describeNames).toEqual(['feature: sample test extraction']);
    expect(testNames).toEqual([
      'it:snapshot: extracts template literal titles ',
      'test:happy: extracts direct test titles',
    ]);
  });

  test('happy: double-star traverses descendants at any depth', async () => {
    const traversal = new CodeTraversal(fixtureRoot);

    const results = await traversal.find(`${testGlob}#**/describe`);
    const names = toArray(results).map((node) => node.getProperty('name'));

    expect(names).toEqual(['feature: sample test extraction']);
  });
});
