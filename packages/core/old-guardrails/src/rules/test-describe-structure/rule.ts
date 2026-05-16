import ts from 'typescript';
import { Guardrail } from '../../constructs/guardrail';
import type { Reporter } from '../../reporter';
import { testDescribeStructureErrors } from './errors';
import type { TestDescribeStructureErrorId, TestDescribeStructureRuleOptions, TestRuleInput } from './types';

/**
 * Enforces configured describe naming and nesting for TypeScript test files.
 */
export class Rule extends Guardrail<TestDescribeStructureRuleOptions> {
  public readonly name = 'test-describe-structure';

  /**
   * Checks every TypeScript test file.
   */
  public async check() {
    await this.forEachTypescriptFile((input) => {
      if (input.file.endsWith('.test.ts')) {
        this.checkFile(input);
      }
    });
  }

  private checkFile(input: TestRuleInput) {
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node) && this.getDirectCallName(node) === 'describe') {
        this.checkDescribe(node, input.reporter);
      }
      ts.forEachChild(node, visit);
    };

    visit(input.sourceFile);
  }

  private checkDescribe(node: ts.CallExpression, reporter: Reporter) {
    if (!this.firstStringArgStartsWith(node, this.options.describeNamePrefix ?? 'feature: ')) {
      this.fail(reporter, 'describe-name');
    }
    if (!(this.options.allowNestedDescribe ?? false) && this.describeDepth(node) > 0) {
      this.fail(reporter, 'nested-describe');
    }
  }

  private firstStringArgStartsWith(node: ts.CallExpression, prefix: string) {
    const firstArg = node.arguments[0];
    if (ts.isStringLiteral(firstArg) || ts.isNoSubstitutionTemplateLiteral(firstArg)) {
      return firstArg.text.startsWith(prefix);
    }
    if (ts.isTemplateExpression(firstArg)) {
      return firstArg.head.text.startsWith(prefix);
    }
    return false;
  }

  private describeDepth(node: ts.Node) {
    let depth = 0;
    let current = node.parent;

    while (current !== undefined) {
      if (ts.isCallExpression(current) && this.getDirectCallName(current) === 'describe') {
        depth++;
      }
      current = current.parent;
    }

    return depth;
  }

  private getDirectCallName(node: ts.CallExpression) {
    return ts.isIdentifier(node.expression) ? node.expression.text : '';
  }

  private fail(reporter: Reporter, error: TestDescribeStructureErrorId) {
    reporter.fail({ error, ...testDescribeStructureErrors[error] });
  }
}
