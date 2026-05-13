import { resolve } from 'node:path';

const escapeCharacter = String.fromCharCode(27);

export const ansiPattern = new RegExp(`${escapeCharacter}\\[[0-9;]*m`, 'g');
export const fixturePath = resolve(import.meta.dirname, 'fixtures', 'sample.ts');
export const snapshotsDir = resolve(import.meta.dirname, 'snapshots');

export const sampleDiagnostic = {
  error: 'sample-error',
  description: 'A sample diagnostic was reported.',
  recommendation: 'Fix the sample diagnostic.',
};

export const passingRun = {
  rule: 'sample-rule',
  passed: true,
  results: [
    { rule: 'sample-rule', passed: true, diagnostics: [], durationMs: 3, filesScanned: new Set(['src/index.ts']) },
  ],
  totalDurationMs: 5,
};

export const failingRun = {
  passed: false,
  results: [
    {
      rule: 'sample-rule',
      passed: false,
      diagnostics: [
        {
          ...sampleDiagnostic,
          file: 'src/example.ts',
          line: 2,
          snippet: '  1 | const first = true;\n> 2 | const second = false;',
        },
      ],
      durationMs: 7,
      filesScanned: new Set(['src/example.ts']),
    },
  ],
  totalDurationMs: 9,
};
