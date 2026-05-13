import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { formatResults } from './format-results';
import { Reporter } from './reporter';
import {
  ansiPattern,
  failingRun,
  fixturePath,
  passingRun,
  sampleDiagnostic,
  snapshotsDir,
} from './reporter.test-constants';

describe('feature: reporter output', () => {
  test('happy: formats a passing run', () => {
    const received = formatResults(passingRun).replace(ansiPattern, '');
    const snapshot = readFileSync(resolve(snapshotsDir, 'passing-run.md'), 'utf-8');

    expect(received).toBe(snapshot);
  });

  test('unhappy: formats grouped diagnostics', () => {
    const received = formatResults(failingRun).replace(ansiPattern, '');
    const snapshot = readFileSync(resolve(snapshotsDir, 'failing-run.md'), 'utf-8');

    expect(received).toBe(snapshot);
  });

  test('unhappy: records diagnostics with file snippets', () => {
    const reporter = new Reporter('sample-rule', fixturePath);
    reporter.failAtLine(sampleDiagnostic, 2);
    const diagnostic = reporter.diagnostics.at(0);
    if (diagnostic === undefined) {
      throw new Error('Expected reporter diagnostic.');
    }
    const received = `${JSON.stringify([{ ...diagnostic, file: '<fixture>' }], null, 2)}\n`;
    expect(received).toBe(readFileSync(resolve(snapshotsDir, 'diagnostic-snippet.md'), 'utf-8'));
  });
});
