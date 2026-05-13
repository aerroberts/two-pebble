import ts from 'typescript';
import { Guardrail } from '../../constructs/guardrail';
import type { Reporter } from '../../reporter';
import { fileLengthErrors } from './errors';
import type { FileLengthFileType, FileLengthPolicy, FileLengthRuleOptions, SourceFileInput } from './types';

/**
 * Enforces configured line-count limits for different file roles.
 */
export class Rule extends Guardrail<FileLengthRuleOptions> {
  public readonly name = 'file-length';

  /**
   * Checks TypeScript and TSX files against each matching configured file role.
   */
  public async check() {
    await this.forEachTypescriptFile((input) => {
      if (!input.file.endsWith('.test.ts')) {
        this.checkFile(input, ['typescriptFile', ...this.classFileType(input)]);
      }
    });
    await this.forEachTsxFile((input) => this.checkFile(input, ['reactFile']));
  }

  private checkFile(input: SourceFileInput, fileTypes: FileLengthFileType[]) {
    for (const fileType of fileTypes) {
      if (this.lineCount(input.sourceText) > this.policyFor(fileType).maxLines) {
        this.fail(input.reporter);
      }
    }
  }

  private classFileType(input: SourceFileInput): FileLengthFileType[] {
    return input.sourceFile.statements.some(ts.isClassDeclaration) ? ['classFile'] : [];
  }

  private lineCount(sourceText: string) {
    return sourceText.split('\n').length;
  }

  private policyFor(fileType: FileLengthFileType): Required<FileLengthPolicy> {
    return { maxLines: this.options.files?.[fileType]?.maxLines ?? this.defaultMaxLinesFor(fileType) };
  }

  private defaultMaxLinesFor(fileType: FileLengthFileType) {
    if (fileType === 'reactFile') {
      return 300;
    }
    return 400;
  }

  private fail(reporter: Reporter) {
    reporter.fail({ error: 'file-too-long', ...fileLengthErrors['file-too-long'] });
  }
}
