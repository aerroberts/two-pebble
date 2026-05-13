import ts from 'typescript';
import { Guardrail } from '../../constructs/guardrail';
import type { Reporter } from '../../reporter';
import { reactJsxStyleErrors } from './errors';
import type { ReactJsxStyleRuleOptions, ReactRuleInput } from './types';

/**
 * Enforces the configured banned JSX attribute list for TSX files.
 */
export class Rule extends Guardrail<ReactJsxStyleRuleOptions> {
  public readonly name = 'react-jsx-style';

  /**
   * Checks every TSX file.
   */
  public async check() {
    await this.forEachTsxFile((input) => this.checkFile(input));
  }

  private checkFile(input: ReactRuleInput) {
    const visit = (node: ts.Node) => {
      if (ts.isJsxAttribute(node) && this.isBannedJsxAttribute(node)) {
        this.failAtNode(input.reporter, node);
      }

      ts.forEachChild(node, visit);
    };

    visit(input.sourceFile);
  }

  private isBannedJsxAttribute(node: ts.JsxAttribute) {
    return (this.options.bannedJsxAttributes ?? ['className', 'style']).includes(node.name.getText());
  }

  private failAtNode(reporter: Reporter, node: ts.Node) {
    const line = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart()).line + 1;
    reporter.failAtLine(
      { error: 'react-classname-or-style', ...reactJsxStyleErrors['react-classname-or-style'] },
      line,
    );
  }
}
