import ts from 'typescript';
import { Guardrail } from '../../constructs/guardrail';
import type { Reporter } from '../../reporter';
import { testCaseStructureErrors } from './errors';
import type { TestCaseStructureErrorId, TestCaseStructureRuleOptions, TestRuleInput } from './types';

/**
 * Enforces configured test call placement, naming, and callback length.
 */
export class Rule extends Guardrail<TestCaseStructureRuleOptions> {
  public readonly name = 'test-case-structure';

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
      if (ts.isCallExpression(node) && this.testCallNames().includes(this.getDirectCallName(node))) {
        this.checkTest(input.sourceText, node, input.reporter);
      }

      ts.forEachChild(node, visit);
    };

    visit(input.sourceFile);
  }

  private checkTest(sourceText: string, node: ts.CallExpression, reporter: Reporter) {
    if (this.describeDepth(node) !== (this.options.requiredDescribeDepth ?? 1)) {
      this.fail(reporter, 'test-outside-describe');
    }
    if (!this.hasAllowedTestName(node)) {
      this.fail(reporter, 'test-name');
    }

    const callback = this.getCallback(node);
    if (
      callback &&
      sourceText.slice(callback.getStart(), callback.getEnd()).split('\n').length > (this.options.maxTestLines ?? 12)
    ) {
      this.fail(reporter, 'test-too-long');
    }
  }

  private hasAllowedTestName(node: ts.CallExpression) {
    return this.allowedTestNamePrefixes().some((prefix) => this.firstStringArgStartsWith(node, prefix));
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

  private getCallback(node: ts.CallExpression) {
    return node.arguments.find((argument) => ts.isArrowFunction(argument) || ts.isFunctionExpression(argument));
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

  private testCallNames() {
    return this.options.testCallNames ?? ['test', 'it'];
  }

  private allowedTestNamePrefixes() {
    return this.options.allowedTestNamePrefixes ?? ['happy: ', 'unhappy: ', 'snapshot: '];
  }

  private fail(reporter: Reporter, error: TestCaseStructureErrorId) {
    reporter.fail({ error, ...testCaseStructureErrors[error] });
  }
}
