import { basename } from 'node:path';
import ts from 'typescript';
import { Guardrail } from '../../constructs/guardrail';
import type { Reporter } from '../../reporter';
import { classNameErrors } from './errors';
import type { ClassNameErrorId, ClassNameRuleOptions, ClassRuleInput } from './types';

/**
 * Enforces class declaration names and file names for class files.
 */
export class Rule extends Guardrail<ClassNameRuleOptions> {
  public readonly name = 'class-name';

  /**
   * Checks non-test TypeScript files that define class declarations.
   */
  public async check() {
    await this.forEachTypescriptFile((input) => {
      if (input.file.endsWith('.test.ts')) {
        return;
      }

      this.checkFile(input);
    });
  }

  private checkFile(input: ClassRuleInput) {
    for (const classDeclaration of input.sourceFile.statements.filter(ts.isClassDeclaration)) {
      this.checkClassName(input.file, classDeclaration, input.reporter);
    }
  }

  private checkClassName(file: string, classDeclaration: ts.ClassDeclaration, reporter: Reporter) {
    const className = classDeclaration.name?.text;
    const classNamePattern = this.options.classNamePattern ?? '^[A-Z][A-Za-z0-9]*$';

    if (!className || !new RegExp(classNamePattern).test(className)) {
      this.fail(reporter, 'class-name');
      return;
    }

    if (basename(file) !== this.expectedFileName(className)) {
      this.fail(reporter, 'class-file-name');
    }
  }

  private expectedFileName(className: string) {
    if ((this.options.fileNameCase ?? 'kebab-case') === 'kebab-case') {
      return `${this.toKebabCase(className)}.ts`;
    }

    return `${className}.ts`;
  }

  private toKebabCase(value: string) {
    return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  private fail(reporter: Reporter, error: ClassNameErrorId) {
    reporter.fail({ error, ...classNameErrors[error] });
  }
}
