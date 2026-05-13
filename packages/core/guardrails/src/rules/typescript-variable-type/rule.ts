import ts from 'typescript';
import { Guardrail } from '../../constructs/guardrail';
import type { Reporter } from '../../reporter';
import { typescriptVariableTypeErrors } from './errors';
import type { TypescriptRuleInput, TypescriptVariableTypeRuleOptions } from './types';

/**
 * Enforces configured variable and class field type annotation simplicity.
 */
export class Rule extends Guardrail<TypescriptVariableTypeRuleOptions> {
  public readonly name = 'typescript-variable-type';

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
      if (ts.isVariableDeclaration(node) || ts.isPropertyDeclaration(node)) this.checkDeclaration(node, input.reporter);
      ts.forEachChild(node, visit);
    };

    visit(input.sourceFile);
  }

  private checkDeclaration(node: ts.VariableDeclaration | ts.PropertyDeclaration, reporter: Reporter) {
    if (this.allowsComplexVariableTypes() || this.isGenericBoundary(node) || !node.type) return;
    if (!this.isSimpleType(node.type)) this.fail(reporter);
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

  private isSimpleType(node: ts.TypeNode): boolean {
    if (this.isSimpleKeyword(node)) return true;
    if (ts.isTypeReferenceNode(node)) return this.isSimpleTypeReference(node);
    if (ts.isArrayTypeNode(node)) return this.isSimpleType(node.elementType);
    if (ts.isUnionTypeNode(node))
      return node.types.length <= this.maxSimpleUnionMembers() && node.types.every((type) => this.isSimpleType(type));
    return false;
  }

  private isSimpleKeyword(node: ts.TypeNode) {
    return (
      node.kind === ts.SyntaxKind.BooleanKeyword ||
      node.kind === ts.SyntaxKind.NeverKeyword ||
      node.kind === ts.SyntaxKind.NullKeyword ||
      node.kind === ts.SyntaxKind.NumberKeyword ||
      node.kind === ts.SyntaxKind.StringKeyword ||
      node.kind === ts.SyntaxKind.SymbolKeyword ||
      node.kind === ts.SyntaxKind.UndefinedKeyword ||
      node.kind === ts.SyntaxKind.VoidKeyword
    );
  }

  private isSimpleTypeReference(node: ts.TypeReferenceNode) {
    if (!this.isSimpleTypeName(node.typeName)) return false;
    if (node.typeArguments === undefined) return true;
    return node.typeArguments.every((type) => this.isSimpleGenericArgument(type));
  }

  private isSimpleGenericArgument(node: ts.TypeNode): boolean {
    if (this.isSimpleKeyword(node)) return true;
    if (ts.isTypeReferenceNode(node)) return node.typeArguments === undefined && this.isSimpleTypeName(node.typeName);
    if (ts.isArrayTypeNode(node)) return this.isSimpleGenericArgument(node.elementType);
    if (ts.isUnionTypeNode(node))
      return (
        node.types.length <= this.maxSimpleUnionMembers() &&
        node.types.every((type) => this.isSimpleGenericArgument(type))
      );
    return false;
  }

  private isSimpleTypeName(name: ts.EntityName) {
    return ts.isIdentifier(name) || ts.isQualifiedName(name);
  }

  private maxSimpleUnionMembers() {
    return this.options.maxSimpleUnionMembers ?? 5;
  }

  private allowsComplexVariableTypes() {
    return this.options.allowComplexVariableTypes ?? false;
  }

  private fail(reporter: Reporter) {
    reporter.fail({ error: 'complex-variable-type', ...typescriptVariableTypeErrors['complex-variable-type'] });
  }
}
