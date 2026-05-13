import { basename } from 'node:path';
import ts from 'typescript';
import { Guardrail } from '../../constructs/guardrail';
import type { Reporter } from '../../reporter';
import { typescriptReExportOnlyFileErrors } from './errors';
import type { TypescriptReExportOnlyFileRuleOptions, TypescriptRuleInput } from './types';

/**
 * Enforces the configured policy for non-index TypeScript files that only re-export another module.
 */
export class Rule extends Guardrail<TypescriptReExportOnlyFileRuleOptions> {
  public readonly name = 'typescript-re-export-only-file';

  /**
   * Checks every non-test TypeScript file.
   */
  public async check() {
    await this.forEachTypescriptFile((input) => {
      if (input.file.endsWith('.test.ts')) {
        return;
      }
      this.checkFile(input);
    });
  }

  private checkFile(input: TypescriptRuleInput) {
    if (this.options.allowReExportOnlyFiles ?? false) {
      return;
    }
    if (basename(input.file) === 'index.ts') {
      return;
    }
    if (this.isReExportOnlyFile(input.sourceFile)) {
      this.fail(input.reporter);
    }
  }

  private isReExportOnlyFile(sourceFile: ts.SourceFile) {
    return (
      sourceFile.statements.length > 0 && sourceFile.statements.every((statement) => ts.isExportDeclaration(statement))
    );
  }

  private fail(reporter: Reporter) {
    reporter.fail({ error: 're-export-only-file', ...typescriptReExportOnlyFileErrors['re-export-only-file'] });
  }
}
