import type { Diagnostic } from '../types';

/**
 * Collects diagnostics for a single structure rule execution.
 */
export class Reporter {
  public readonly find: string;
  public readonly guidance: string;
  public readonly diagnostics: Diagnostic[] = [];

  public constructor(find: string, guidance: string) {
    this.find = find;
    this.guidance = guidance;
  }

  public get passed() {
    return this.diagnostics.length === 0;
  }

  /**
   * Records a diagnostic failure for the current rule.
   */
  public fail(diagnostic: Omit<Diagnostic, 'find' | 'guidance'>) {
    this.diagnostics.push({
      ...diagnostic,
      find: this.find,
      guidance: this.guidance,
    });
  }
}
