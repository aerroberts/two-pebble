import ts from 'typescript';
import { Guardrail } from '../../constructs/guardrail';
import type { Reporter } from '../../reporter';
import { typescriptTypeSafetyErrors } from './errors';
import type { TypescriptRuleInput, TypescriptTypeSafetyErrorId, TypescriptTypeSafetyRuleOptions } from './types';

/**
 * Enforces configured TypeScript escape hatch policy.
 */
export class Rule extends Guardrail<TypescriptTypeSafetyRuleOptions> {
  public readonly name = 'typescript-type-safety';

  /**
   * Checks every non-test TypeScript file.
   */
  public async check() {
    await this.forEachTypescriptFile((input) => {
      if (input.file.endsWith('.test.ts')) return;
      this.checkFile(input);
    });
  }

  private checkFile(input: TypescriptRuleInput) {
    const visit = (node: ts.Node) => {
      this.checkNode(node, input.reporter);
      ts.forEachChild(node, visit);
    };

    visit(input.sourceFile);
  }

  private checkNode(node: ts.Node, reporter: Reporter) {
    if (this.isForbiddenIdentifier(node)) {
      this.fail(reporter, 'forbidden-global-this');
    }

    if (this.isForbiddenTypeSyntax(node)) {
      this.fail(reporter, 'type-escape-hatch');
    }
  }

  private isForbiddenIdentifier(node: ts.Node) {
    return ts.isIdentifier(node) && this.forbiddenSyntax().includes('globalThis') && node.text === 'globalThis';
  }

  private isForbiddenTypeSyntax(node: ts.Node) {
    return (
      (this.forbiddenSyntax().includes('any') && node.kind === ts.SyntaxKind.AnyKeyword) ||
      (this.forbiddenSyntax().includes('unknown') && node.kind === ts.SyntaxKind.UnknownKeyword) ||
      (this.forbiddenSyntax().includes('satisfies') && ts.isSatisfiesExpression(node))
    );
  }

  private forbiddenSyntax() {
    return this.options.forbiddenSyntax ?? ['any', 'unknown', 'satisfies', 'globalThis'];
  }

  private fail(reporter: Reporter, error: TypescriptTypeSafetyErrorId) {
    reporter.fail({ error, ...typescriptTypeSafetyErrors[error] });
  }
}
