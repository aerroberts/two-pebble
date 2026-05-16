import { describe, expect, test } from 'bun:test';
import { probeContext } from './guardrail.test-constants';
import { ProbeGuardrail } from './probe-guardrail';

describe('feature: guardrail base class', () => {
  test('happy: stores run context and exposes collected reporters', async () => {
    const rule = new ProbeGuardrail(probeContext);
    await rule.check();

    expect({ checkedWith: rule.checkedWith, report: rule.getReport() }).toEqual({
      checkedWith: 'checked',
      report: [expect.objectContaining({ file: 'src/example.ts', rule: 'probe' })],
    });
  });

  test('happy: reuses reporters by file', () => {
    const rule = new ProbeGuardrail(probeContext);

    expect(rule.getReporter('src/example.ts')).toBe(rule.getReporter('src/example.ts'));
  });
});
