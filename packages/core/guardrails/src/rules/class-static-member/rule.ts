import ts from 'typescript';
import { Guardrail } from '../../constructs/guardrail';
import type { Reporter } from '../../reporter';
import { classStaticMemberErrors } from './errors';
import type { ClassRuleInput, ClassStaticMemberRuleOptions } from './types';

/**
 * Enforces the configured static member policy for class declarations.
 */
export class Rule extends Guardrail<ClassStaticMemberRuleOptions> {
  public readonly name = 'class-static-member';

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
    if (this.options.allowStaticMembers ?? false) {
      return;
    }

    for (const classDeclaration of input.sourceFile.statements.filter(ts.isClassDeclaration)) {
      for (const member of classDeclaration.members) {
        if (this.hasModifier(member, ts.SyntaxKind.StaticKeyword)) {
          this.fail(input.reporter);
        }
      }
    }
  }

  private hasModifier(node: ts.Node, kind: ts.SyntaxKind) {
    return ts.canHaveModifiers(node) && (ts.getModifiers(node)?.some((modifier) => modifier.kind === kind) ?? false);
  }

  private fail(reporter: Reporter) {
    reporter.fail({ error: 'static-class-member', ...classStaticMemberErrors['static-class-member'] });
  }
}
