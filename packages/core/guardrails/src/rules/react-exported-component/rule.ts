import { basename } from 'node:path';
import ts from 'typescript';
import { Guardrail } from '../../constructs/guardrail';
import type { Reporter } from '../../reporter';
import { reactExportedComponentErrors } from './errors';
import type { ReactExportedComponentErrorId, ReactExportedComponentRuleOptions, ReactRuleInput } from './types';

/**
 * Enforces exported component count and file-name matching for TSX files.
 */
export class Rule extends Guardrail<ReactExportedComponentRuleOptions> {
  public readonly name = 'react-exported-component';

  /**
   * Checks every TSX file.
   */
  public async check() {
    await this.forEachTsxFile((input) => this.checkFile(input));
  }

  private checkFile(input: ReactRuleInput) {
    const names = input.sourceFile.statements.flatMap((statement) => this.getExportedFunctionNames(statement));

    if (names.length > (this.options.maxExportedFunctions ?? 1)) {
      this.fail(input.reporter, 'multiple-exported-functions');
    }

    for (const name of names) {
      if ((this.options.enforceFileNameMatch ?? true) && name !== this.toPascalCase(basename(input.file, '.tsx'))) {
        this.fail(input.reporter, 'component-file-name');
      }
    }
  }

  private getExportedFunctionNames(statement: ts.Statement) {
    if (ts.isFunctionDeclaration(statement) && this.isExported(statement) && statement.name)
      return [statement.name.text];
    if (!ts.isVariableStatement(statement) || !this.isExported(statement)) return [];
    return statement.declarationList.declarations
      .filter((declaration) => this.isFunctionVariable(declaration))
      .flatMap((declaration) => (ts.isIdentifier(declaration.name) ? [declaration.name.text] : []));
  }

  private isFunctionVariable(declaration: ts.VariableDeclaration) {
    return (
      declaration.initializer !== undefined &&
      (ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer))
    );
  }

  private isExported(node: ts.Node) {
    return (
      ts.canHaveModifiers(node) &&
      (ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false)
    );
  }

  private toPascalCase(value: string) {
    return value
      .split(/[-_.\s]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

  private fail(reporter: Reporter, error: ReactExportedComponentErrorId) {
    reporter.fail({ error, ...reactExportedComponentErrors[error] });
  }
}
