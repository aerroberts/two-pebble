import type { Diagnostic } from '../types';

/**
 * Collects diagnostics for a single structure rule execution.
 */
export class Reporter {
  public readonly find: string;
  public readonly recommendation: string;
  public readonly diagnostics: Diagnostic[] = [];

  public constructor(find: string, recommendation: string) {
    this.find = find;
    this.recommendation = recommendation;
  }

  public get passed() {
    return this.diagnostics.length === 0;
  }

  /**
   * Records a diagnostic failure for the current rule.
   */
  public fail(diagnostic: Omit<Diagnostic, 'find' | 'recommendation'>) {
    this.diagnostics.push({
      ...diagnostic,
      find: this.find,
      recommendation: this.recommendation,
    });
  }
}
