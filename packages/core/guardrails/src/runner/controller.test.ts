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

const fixtureRoot = resolve(import.meta.dirname, 'fixtures/sample-package');

describe('feature: controller', () => {
  test('happy: exists:true passes when the find matches a file', async () => {
    const config: GuardrailConfig = {
      structure: [
        {
          find: 'src/present.ts',
          recommendation: 'src/present.ts must exist.',
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
          recommendation: 'src/missing.ts must exist.',
          asserts: { exists: true },
        },
      ],
    };

    const result = await new Controller().run(fixtureRoot, config);

    expect(result.passed).toBe(false);
    expect(result.results[0]?.diagnostics).toEqual([
      {
        find: 'src/missing.ts',
        recommendation: 'src/missing.ts must exist.',
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
          recommendation: 'src/forbidden.ts must not exist.',
          asserts: { exists: false },
        },
      ],
    };

    const result = await new Controller().run(fixtureRoot, config);

    expect(result.passed).toBe(true);
  });

  test('happy: type assertion validates the returned node kind', async () => {
    const config: GuardrailConfig = {
      structure: [
        {
          find: 'src/present.ts',
          recommendation: 'src/present.ts must be a file.',
          asserts: { type: 'file' },
        },
      ],
    };

    const result = await new Controller().run(fixtureRoot, config);

    expect(result.passed).toBe(true);
  });

  test('happy: matches assertion enforces an exact count', async () => {
    const config: GuardrailConfig = {
      structure: [
        {
          find: 'src/present.ts',
          recommendation: 'Each present file must have exactly one exported const.',
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

  test('happy: failed assert recommendation stacks leading comments and recommendations top-down', async () => {
    const { parseGuardConfig } = await import('./guard-config-parser');
    const config = parseGuardConfig(`
      {
        "structure": [
          // First include this string
          {
            "find": "src/present.ts",
            "recommendation": "included next",
            "code": [
              // Then also include this
              {
                "find": "export/function",
                "recommendation": "then include this",
                "asserts": { "matches": { "exactly": 1 } }
              }
            ]
          }
        ]
      }
    `);

    const result = await new Controller().run(fixtureRoot, config);
    const codeCheck = result.results.find((check) => check.find.includes('export/function'));

    expect(codeCheck?.diagnostics[0]?.recommendation).toBe(
      ['First include this string', 'included next', 'Then also include this', 'then include this'].join('\n'),
    );
  });
});
