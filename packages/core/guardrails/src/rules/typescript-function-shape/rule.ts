import ts from 'typescript';
import { Guardrail } from '../../constructs/guardrail';
import type { Reporter } from '../../reporter';
import { typescriptFunctionShapeErrors } from './errors';
import { isSimpleType } from './type-shape';
import type { TypescriptFunctionShapeErrorId, TypescriptFunctionShapeRuleOptions, TypescriptRuleInput } from './types';

/**
 * Enforces configured function parameter and signature shape limits.
 */
export class Rule extends Guardrail<TypescriptFunctionShapeRuleOptions> {
  public readonly name = 'typescript-function-shape';

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
      if (this.isFunctionLike(node)) this.checkFunction(node as ts.FunctionLikeDeclaration, input.reporter);
      ts.forEachChild(node, visit);
    };

    visit(input.sourceFile);
  }

  private checkFunction(node: ts.FunctionLikeDeclaration, reporter: Reporter) {
    if (node.parameters.length > (this.options.maxFunctionParameters ?? 3)) {
      this.fail(reporter, 'too-many-parameters');
    }

    const isGenericBoundary = this.isGenericBoundary(node);
    for (const parameter of node.parameters) this.checkParameter(parameter, reporter, isGenericBoundary);

    if (
      !this.allowsComplexSignatureTypes() &&
      !isGenericBoundary &&
      node.type &&
      !isSimpleType(node.type, { maxSimpleUnionMembers: this.maxSimpleUnionMembers() })
    ) {
      this.fail(reporter, 'complex-signature-type');
    }
  }

  private checkParameter(parameter: ts.ParameterDeclaration, reporter: Reporter, isGenericBoundary: boolean) {
    if (!(this.options.allowOptionalParameters ?? false) && parameter.questionToken)
      this.fail(reporter, 'optional-parameter');
    if (!(this.options.allowDefaultParameters ?? false) && parameter.initializer)
      this.fail(reporter, 'default-parameter');
    if (
      !this.allowsComplexSignatureTypes() &&
      !isGenericBoundary &&
      parameter.type &&
      !isSimpleType(parameter.type, { maxSimpleUnionMembers: this.maxSimpleUnionMembers() })
    )
      this.fail(reporter, 'complex-signature-type');
  }

  private isFunctionLike(node: ts.Node) {
    return (
      ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node) ||
      ts.isMethodDeclaration(node) ||
      ts.isConstructorDeclaration(node) ||
      ts.isGetAccessorDeclaration(node) ||
      ts.isSetAccessorDeclaration(node)
    );
  }

  private isGenericBoundary(node: ts.Node) {
    let current: ts.Node | undefined = node;

    while (current !== undefined) {
      if (this.hasTypeParameters(current)) return true;
      current = current.parent;
    }

    return false;
  }

  private hasTypeParameters(node: ts.Node) {
    if (ts.isClassDeclaration(node) || ts.isClassExpression(node) || ts.isFunctionDeclaration(node))
      return node.typeParameters !== undefined;
    if (ts.isFunctionExpression(node) || ts.isArrowFunction(node) || ts.isMethodDeclaration(node))
      return node.typeParameters !== undefined;
    if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) return node.typeParameters !== undefined;
    return false;
  }

  private maxSimpleUnionMembers() {
    return this.options.maxSimpleUnionMembers ?? 5;
  }

  private allowsComplexSignatureTypes() {
    return this.options.allowComplexSignatureTypes ?? false;
  }

  private fail(reporter: Reporter, error: TypescriptFunctionShapeErrorId) {
    reporter.fail({ error, ...typescriptFunctionShapeErrors[error] });
  }
}
