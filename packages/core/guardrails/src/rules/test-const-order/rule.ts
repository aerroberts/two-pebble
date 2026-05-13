import ts from 'typescript';
import { Guardrail } from '../../constructs/guardrail';
import type { Reporter } from '../../reporter';
import { testConstOrderErrors } from './errors';
import type { TestConstOrderRuleOptions, TestRuleInput } from './types';

/**
 * Enforces the configured top-level const ordering policy for TypeScript test files.
 */
export class Rule extends Guardrail<TestConstOrderRuleOptions> {
  public readonly name = 'test-const-order';

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
    if (this.options.allowConstAfterDescribe ?? false) {
      return;
    }

    let hasSeenDescribe = false;
    for (const statement of input.sourceFile.statements) {
      if (this.isTopLevelDescribe(statement)) {
        hasSeenDescribe = true;
      }
      if (hasSeenDescribe && this.isConstStatement(statement)) {
        this.fail(input.reporter);
      }
    }
  }

  private isTopLevelDescribe(statement: ts.Statement) {
    return (
      ts.isExpressionStatement(statement) &&
      ts.isCallExpression(statement.expression) &&
      this.getDirectCallName(statement.expression) === 'describe'
    );
  }

  private isConstStatement(statement: ts.Statement) {
    return (
      ts.isVariableStatement(statement) &&
      (ts.getCombinedNodeFlags(statement.declarationList) & ts.NodeFlags.Const) === ts.NodeFlags.Const
    );
  }

  private getDirectCallName(node: ts.CallExpression) {
    return ts.isIdentifier(node.expression) ? node.expression.text : '';
  }

  private fail(reporter: Reporter) {
    reporter.fail({ error: 'test-const-after-describe', ...testConstOrderErrors['test-const-after-describe'] });
  }
}
