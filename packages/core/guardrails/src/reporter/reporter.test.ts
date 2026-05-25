import { describe, expect, test } from 'bun:test';
import type { RunResult } from '../types';
import { formatResults } from './format-results';
import { Reporter } from './reporter';

/**
 * Testing philosophy:
 * The reporter is the bridge between rule outcomes and the user-facing report.
 * The tests build representative diagnostics with the Reporter and confirm
 * formatResults turns passing and failing runs into the expected text.
 */

const ansiPattern = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');

function strip(text: string) {
  return text.replace(ansiPattern, '');
}

describe('feature: reporter', () => {
  test('happy: records a diagnostic with the rule context', () => {
    const reporter = new Reporter('src/asserts/exists.ts', 'exists.ts must be present.');

    reporter.fail({
      description: 'Expected a node, found none.',
      assertion: 'exists',
    });

    expect(reporter.passed).toBe(false);
    expect(reporter.diagnostics).toEqual([
      {
        description: 'Expected a node, found none.',
        assertion: 'exists',
        find: 'src/asserts/exists.ts',
        guidance: 'exists.ts must be present.',
      },
    ]);
  });

  test('happy: passing run renders a single PASS line and summary', () => {
    const run: RunResult = {
      passed: true,
      totalDurationMs: 5,
      filesScanned: new Set(['src/asserts/exists.ts']),
      results: [
        {
          find: 'src/asserts/exists.ts',
          guidance: 'must exist',
          passed: true,
          diagnostics: [],
          durationMs: 3,
        },
      ],
    };

    const output = strip(formatResults(run));

    expect(output).toContain(' PASS  src/asserts/exists.ts');
    expect(output).toContain('1 rule checked');
    expect(output).toContain('0 errors');
  });

  test('unhappy: failing run renders FAIL header, description, and fix', () => {
    const run: RunResult = {
      passed: false,
      totalDurationMs: 9,
      filesScanned: new Set(),
      results: [
        {
          find: 'src/asserts/missing.ts',
          guidance: 'src/asserts/missing.ts must be present.',
          passed: false,
          diagnostics: [
            {
              find: 'src/asserts/missing.ts',
              guidance: 'src/asserts/missing.ts must be present.',
              assertion: 'exists',
              description: 'Expected the structure find to return at least one node, but none matched.',
            },
          ],
          durationMs: 4,
        },
      ],
    };

    const output = strip(formatResults(run));

    expect(output).toContain(' FAIL  src/asserts/missing.ts');
    expect(output).toContain('Expected the structure find to return at least one node, but none matched.');
    expect(output).toContain('fix: src/asserts/missing.ts must be present.');
    expect(output).toContain('assertion: exists');
    expect(output).toContain('1 error');
  });
});
