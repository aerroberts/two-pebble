import ts from 'typescript';
import { Guardrail } from '../../constructs/guardrail';
import type { Reporter } from '../../reporter';
import { isSimpleType } from '../typescript-function-shape/type-shape';
import { reactFunctionParameterErrors } from './errors';
import type { ReactFunctionParameterErrorId, ReactFunctionParameterRuleOptions, ReactRuleInput } from './types';

/**
 * Enforces the configured object-parameter destructuring policy for React functions.
 */
export class Rule extends Guardrail<ReactFunctionParameterRuleOptions> {
  public readonly name = 'react-function-parameter';

  /**
   * Checks every TSX file.
   */
  public async check() {
    await this.forEachTsxFile((input) => this.checkFile(input));
  }

  private checkFile(input: ReactRuleInput) {
    const visit = (node: ts.Node) => {
      if (this.isFunctionLike(node)) this.checkFunctionParameters(node as ts.FunctionLikeDeclaration, input.reporter);
      ts.forEachChild(node, visit);
    };

    visit(input.sourceFile);
  }

  private checkFunctionParameters(node: ts.FunctionLikeDeclaration, reporter: Reporter) {
    for (const parameter of node.parameters) {
      if (!(this.options.allowDestructuredFunctionParameters ?? false) && ts.isObjectBindingPattern(parameter.name)) {
        this.failAtNode(reporter, parameter, 'destructured-function-parameter');
      }

      if (
        !(this.options.allowComplexSignatureTypes ?? false) &&
        parameter.type &&
        !isSimpleType(parameter.type, { maxSimpleUnionMembers: this.options.maxSimpleUnionMembers })
      ) {
        this.failAtNode(reporter, parameter.type, 'complex-signature-type');
      }
    }
  }

  private isFunctionLike(node: ts.Node) {
    return (
      ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node) ||
      ts.isMethodDeclaration(node)
    );
  }

  private failAtNode(reporter: Reporter, node: ts.Node, error: ReactFunctionParameterErrorId) {
    const line = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart()).line + 1;
    reporter.failAtLine({ error, ...reactFunctionParameterErrors[error] }, line);
  }
}
