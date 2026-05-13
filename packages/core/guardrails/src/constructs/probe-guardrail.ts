import { Guardrail } from './guardrail';

/**
 * Test-only guardrail implementation.
 * It exposes the protected base-class behavior.
 * Guardrail tests assert reporter reuse and options flow through it.
 */
export class ProbeGuardrail extends Guardrail<{ expected: string }> {
  public readonly name = 'probe';
  public checkedWith?: string;

  /**
   * Runs the probe check.
   * The check records options and creates one reporter.
   * Tests assert those observable effects.
   */
  public async check() {
    this.checkedWith = this.options.expected;
    this.getReporter('src/example.ts');
  }
}
