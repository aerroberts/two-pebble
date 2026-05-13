import { Guardrail } from '../../constructs/guardrail';
import type { Reporter } from '../../reporter';
import { indentErrors } from './errors';
import type { IndentFileType, IndentPolicy, IndentRuleOptions, SourceFileInput } from './types';

/**
 * Enforces configured maximum indentation depth for TypeScript and TSX files.
 */
export class Rule extends Guardrail<IndentRuleOptions> {
  public readonly name = 'indent';

  /**
   * Checks TypeScript and TSX files against each matching configured file role.
   */
  public async check() {
    await this.forEachTypescriptFile((input) => {
      if (!input.file.endsWith('.test.ts')) this.checkFile(input, 'typescriptFile');
    });
    await this.forEachTsxFile((input) => this.checkFile(input, 'reactFile'));
  }

  private checkFile(input: SourceFileInput, fileType: IndentFileType) {
    const policy = this.policyFor(fileType);

    for (const line of input.sourceText.split('\n')) {
      const spaces = line.match(/^ */)?.[0].length ?? 0;
      const levels = spaces / policy.spacesPerIndentLevel;

      if (levels > policy.maxIndentLevel) {
        this.fail(input.reporter);
        return;
      }
    }
  }

  private policyFor(fileType: IndentFileType): Required<IndentPolicy> {
    return {
      maxIndentLevel: this.options.files?.[fileType]?.maxIndentLevel ?? this.defaultMaxIndentLevelFor(fileType),
      spacesPerIndentLevel: this.options.files?.[fileType]?.spacesPerIndentLevel ?? 2,
    };
  }

  private defaultMaxIndentLevelFor(fileType: IndentFileType) {
    if (fileType === 'reactFile') return 10;
    return 6;
  }

  private fail(reporter: Reporter) {
    reporter.fail({ error: 'excessive-indent', ...indentErrors['excessive-indent'] });
  }
}
