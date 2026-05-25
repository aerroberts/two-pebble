import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import type { GuardrailConfig } from '../types';
import { Controller } from './controller';

/**
 * Testing philosophy:
 * The controller wires a parsed config to the traversal package and assertion
 * registry. The tests stand up a tiny sample package on disk and confirm the
 * controller passes when files exist and fails when they don't.
 */

const fixtureRoot = resolve(import.meta.dirname, '../test-resources/sample-package');

describe('feature: controller', () => {
  test('happy: exists:true passes when the find matches a file', async () => {
    const config: GuardrailConfig = {
      structure: [
        {
          find: 'src/present.ts',
          asserts: { exists: true },
        },
      ],
    };

    const result = await new Controller().run(fixtureRoot, config);

    expect(result.passed).toBe(true);
    expect(result.results[0]?.diagnostics).toEqual([]);
  });

  test('unhappy: exists:true fails when the find matches nothing', async () => {
    const config: GuardrailConfig = {
      structure: [
        {
          find: 'src/missing.ts',
          asserts: { exists: true },
        },
      ],
    };

    const result = await new Controller().run(fixtureRoot, config);

    expect(result.passed).toBe(false);
    expect(result.results[0]?.diagnostics).toEqual([
      {
        find: 'src/missing.ts',
        guidance: '',
        assertion: 'exists',
        description: 'Expected the structure find to return at least one node, but none matched.',
      },
    ]);
  });

  test('happy: exists:false passes when the find matches nothing', async () => {
    const config: GuardrailConfig = {
      structure: [
        {
          find: 'src/forbidden.ts',
          asserts: { exists: false },
        },
      ],
    };

    const result = await new Controller().run(fixtureRoot, config);

    expect(result.passed).toBe(true);
  });

  test('happy: legacy @group inherit resolves root guard definitions', async () => {
    const config: GuardrailConfig = {
      inherit: '@group/guardrails-typescript',
      structure: [],
    };

    const result = await new Controller().run(fixtureRoot, config);

    expect(result.passed).toBe(true);
  });

  test('happy: type assertion validates the returned node kind', async () => {
    const config: GuardrailConfig = {
      structure: [
        {
          find: 'src/present.ts',
          asserts: { type: 'file' },
        },
      ],
    };

    const result = await new Controller().run(fixtureRoot, config);

    expect(result.passed).toBe(true);
  });

  test('happy: named assertion matches when the node name lines up', async () => {
    const config: GuardrailConfig = {
      structure: [
        {
          find: 'src/present.ts',
          asserts: { exists: true },
          code: [
            {
              find: 'export/const',
              asserts: { named: 'present' },
            },
          ],
        },
      ],
    };

    const result = await new Controller().run(fixtureRoot, config);

    expect(result.passed).toBe(true);
  });

  test('unhappy: named assertion fails when the node name does not match', async () => {
    const config: GuardrailConfig = {
      structure: [
        {
          find: 'src/present.ts',
          asserts: { exists: true },
          code: [
            {
              find: 'export/const',
              asserts: { named: 'expected' },
            },
          ],
        },
      ],
    };

    const result = await new Controller().run(fixtureRoot, config);
    const codeCheck = result.results.find((check) => check.find.includes('export/const'));

    expect(codeCheck?.passed).toBe(false);
    expect(codeCheck?.diagnostics[0]?.assertion).toBe('named');
  });

  test('happy: startsWith assertion matches node metadata prefixes', async () => {
    const config: GuardrailConfig = {
      structure: [
        {
          find: 'src/present.ts',
          code: [
            {
              find: 'export/const',
              asserts: { startsWith: { property: 'name', values: 'pre' } },
            },
          ],
        },
      ],
    };

    const result = await new Controller().run(fixtureRoot, config);

    expect(result.passed).toBe(true);
  });

  test('happy: exclude removes files that the find would have matched', async () => {
    const config: GuardrailConfig = {
      structure: [
        {
          find: 'src/*.ts',
          exclude: 'src/present.ts',
          asserts: { matches: { exactly: 1 } },
        },
      ],
    };

    const result = await new Controller().run(fixtureRoot, config);

    expect(result.passed).toBe(true);
  });

  test('happy: exclude removes AST nodes inside a code rule', async () => {
    const config: GuardrailConfig = {
      structure: [
        {
          find: 'src/extra.ts',
          asserts: { exists: true },
          code: [
            {
              find: ['export/const', 'export/function'],
              exclude: 'export/function',
              asserts: { matches: { exactly: 1 } },
            },
          ],
        },
      ],
    };

    const result = await new Controller().run(fixtureRoot, config);
    const codeCheck = result.results.find((check) => check.find.includes('export/const'));

    expect(codeCheck?.passed).toBe(true);
  });

  test('happy: matches assertion enforces an exact count', async () => {
    const config: GuardrailConfig = {
      structure: [
        {
          find: 'src/present.ts',
          asserts: { exists: true },
          code: [
            {
              find: 'export/const',
              asserts: { matches: { exactly: 1 } },
            },
          ],
        },
      ],
    };

    const result = await new Controller().run(fixtureRoot, config);

    expect(result.passed).toBe(true);
    expect(result.results).toHaveLength(2);
    expect(result.results[1]?.passed).toBe(true);
  });

  test('happy: content includes passes when every needle is in the file', async () => {
    const config: GuardrailConfig = {
      structure: [
        {
          find: 'src/present.ts',
          asserts: { content: { includes: ['export const present', '= true'] } },
        },
      ],
    };

    const result = await new Controller().run(fixtureRoot, config);

    expect(result.passed).toBe(true);
  });

  test('unhappy: content includes fails when a needle is missing', async () => {
    const config: GuardrailConfig = {
      structure: [
        {
          find: 'src/present.ts',
          asserts: { content: { includes: ['TODO: nothing here'] } },
        },
      ],
    };

    const result = await new Controller().run(fixtureRoot, config);

    expect(result.passed).toBe(false);
    expect(result.results[0]?.diagnostics[0]?.assertion).toBe('content');
  });

  test('happy: content lacks passes when no forbidden strings are present', async () => {
    const config: GuardrailConfig = {
      structure: [
        {
          find: 'src/present.ts',
          asserts: { content: { lacks: ['debugger', 'console.log'] } },
        },
      ],
    };

    const result = await new Controller().run(fixtureRoot, config);

    expect(result.passed).toBe(true);
  });

  test('unhappy: content lacks fails when a forbidden string appears', async () => {
    const config: GuardrailConfig = {
      structure: [
        {
          find: 'src/present.ts',
          asserts: { content: { lacks: ['export const'] } },
        },
      ],
    };

    const result = await new Controller().run(fixtureRoot, config);

    expect(result.passed).toBe(false);
    expect(result.results[0]?.diagnostics[0]?.assertion).toBe('content');
  });

  test('happy: map substring/fullyConsumes passes when every fromRef filename appears inside a toRef path', async () => {
    const config: GuardrailConfig = {
      structure: [
        {
          find: 'src/present.ts',
          ref: { name: 'sourceFilenames', extract: 'filename' },
        },
        {
          find: 'src/present.ts',
          ref: { name: 'sourcePaths', extract: 'path' },
          asserts: {
            map: {
              fromRef: 'sourceFilenames',
              toRef: 'sourcePaths',
              method: 'substring',
              fullyConsumes: true,
            },
          },
        },
      ],
    };

    const result = await new Controller().run(fixtureRoot, config);

    expect(result.passed).toBe(true);
  });

  test('unhappy: map fullyConsumes fails when a fromRef value has no toRef match', async () => {
    const config: GuardrailConfig = {
      structure: [
        {
          find: 'src/*.ts',
          ref: { name: 'sourceFilenames', extract: 'filename' },
        },
        {
          find: 'src/present.ts',
          ref: { name: 'presentPath', extract: 'path' },
          asserts: {
            map: {
              fromRef: 'sourceFilenames',
              toRef: 'presentPath',
              method: 'substring',
              fullyConsumes: true,
            },
          },
        },
      ],
    };

    const result = await new Controller().run(fixtureRoot, config);
    const mapDiag = result.results.flatMap((r) => r.diagnostics).find((d) => d.assertion === 'map');

    expect(result.passed).toBe(false);
    expect(mapDiag?.description).toContain('"extra.ts"');
  });

  test('unhappy: map.fromRef referencing an unknown ref fails with a clear diagnostic', async () => {
    const config: GuardrailConfig = {
      structure: [
        {
          find: 'src/present.ts',
          ref: { name: 'local', extract: 'filename' },
          asserts: {
            map: { fromRef: 'undeclared', toRef: 'local', fullyConsumes: true },
          },
        },
      ],
    };

    const result = await new Controller().run(fixtureRoot, config);
    const mapDiag = result.results.flatMap((r) => r.diagnostics).find((d) => d.assertion === 'map');

    expect(result.passed).toBe(false);
    expect(mapDiag?.description).toContain('"undeclared" was not declared');
  });

  test('unhappy: map.toRef referencing an unknown ref fails with a clear diagnostic', async () => {
    const config: GuardrailConfig = {
      structure: [
        {
          find: 'src/present.ts',
          ref: { name: 'local', extract: 'filename' },
          asserts: {
            map: { fromRef: 'local', toRef: 'missing', fullyConsumes: true },
          },
        },
      ],
    };

    const result = await new Controller().run(fixtureRoot, config);
    const mapDiag = result.results.flatMap((r) => r.diagnostics).find((d) => d.assertion === 'map');

    expect(result.passed).toBe(false);
    expect(mapDiag?.description).toContain('"missing" was not declared');
  });

  test('happy: map equals + fullyCovers passes when every toRef filename has a fromRef match', async () => {
    const config: GuardrailConfig = {
      structure: [
        {
          find: 'src/*.ts',
          ref: { name: 'allSources', extract: 'filename' },
        },
        {
          find: 'src/present.ts',
          ref: { name: 'presentOnly', extract: 'filename' },
          asserts: {
            map: { fromRef: 'allSources', toRef: 'presentOnly', method: 'equals', fullyCovers: true },
          },
        },
      ],
    };

    const result = await new Controller().run(fixtureRoot, config);

    expect(result.passed).toBe(true);
  });

  test('happy: failed assert guidance stacks leading comments top-down', async () => {
    const { parseGuardConfig } = await import('./guard-config-parser');
    const config = parseGuardConfig(`
      {
        "structure": [
          // First include this string
          {
            "find": "src/present.ts",
            "code": [
              // Then also include this
              {
                "find": "export/function",
                "asserts": { "matches": { "exactly": 1 } }
              }
            ]
          }
        ]
      }
    `);

    const result = await new Controller().run(fixtureRoot, config);
    const codeCheck = result.results.find((check) => check.find.includes('export/function'));

    expect(codeCheck?.diagnostics[0]?.guidance).toBe(
      ['First include this string', 'Then also include this'].join('\n'),
    );
  });
});
