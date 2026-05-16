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
});
