import ts from 'typescript';
import { Guardrail } from '../../constructs/guardrail';
import type { Reporter } from '../../reporter';
import { testHookErrors } from './errors';
import type { TestHookRuleOptions, TestRuleInput } from './types';

/**
 * Enforces the configured banned test hook call list.
 */
export class Rule extends Guardrail<TestHookRuleOptions> {
  public readonly name = 'test-hook';

  /**
   * Checks every TypeScript test file.
   */
  public async check() {
    await this.forEachTypescriptFile((input) => {
      if (input.file.endsWith('.test.ts')) this.checkFile(input);
    });
  }

  private checkFile(input: TestRuleInput) {
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node) && this.bannedHookNames().includes(this.getCallName(node)))
        this.fail(input.reporter);
      ts.forEachChild(node, visit);
    };

    visit(input.sourceFile);
  }

  private getCallName(node: ts.CallExpression) {
    if (ts.isIdentifier(node.expression)) return node.expression.text;
    if (ts.isPropertyAccessExpression(node.expression)) return node.expression.name.text;
    return '';
  }

  private bannedHookNames() {
    return this.options.bannedHookNames ?? ['beforeEach', 'afterEach', 'beforeAll', 'afterAll'];
  }

  private fail(reporter: Reporter) {
    reporter.fail({ error: 'test-hook', ...testHookErrors['test-hook'] });
  }
}
