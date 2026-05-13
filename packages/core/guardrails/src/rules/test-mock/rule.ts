import ts from 'typescript';
import { Guardrail } from '../../constructs/guardrail';
import type { Reporter } from '../../reporter';
import { testMockErrors } from './errors';
import type { TestMockRuleOptions, TestRuleInput } from './types';

/**
 * Enforces the configured banned mock and spy call list.
 */
export class Rule extends Guardrail<TestMockRuleOptions> {
  public readonly name = 'test-mock';

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
      if (ts.isCallExpression(node) && this.bannedMockNames().includes(this.getCallName(node)))
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

  private bannedMockNames() {
    return this.options.bannedMockNames ?? ['mock', 'spy', 'spyOn'];
  }

  private fail(reporter: Reporter) {
    reporter.fail({ error: 'test-mock-or-spy', ...testMockErrors['test-mock-or-spy'] });
  }
}
