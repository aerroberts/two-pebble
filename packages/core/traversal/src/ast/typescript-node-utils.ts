import ts from 'typescript';
import type { TraversalFunctionKind, TraversalTokenName } from '../types';

export function hasExportModifier(node: ts.Node) {
  return (
    ts.canHaveModifiers(node) &&
    (ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false)
  );
}

export function importPath(sourceFile: ts.SourceFile, node: ts.ImportDeclaration | ts.ImportEqualsDeclaration) {
  if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
    return node.moduleSpecifier.text;
  }
  if (
    ts.isImportEqualsDeclaration(node) &&
    ts.isExternalModuleReference(node.moduleReference) &&
    ts.isStringLiteral(node.moduleReference.expression)
  ) {
    return node.moduleReference.expression.text;
  }

  return node.getText(sourceFile);
}

export function reExportPath(sourceFile: ts.SourceFile, node: ts.ExportDeclaration) {
  return node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)
    ? node.moduleSpecifier.text
    : node.getText(sourceFile);
}

export function functionKind(
  node: ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction | ts.MethodDeclaration,
): TraversalFunctionKind {
  if (ts.isArrowFunction(node)) {
    return 'arrow';
  }
  if (ts.isFunctionExpression(node)) {
    return 'expression';
  }
  if (ts.isMethodDeclaration(node)) {
    return 'method';
  }

  return 'declaration';
}

export function isAsync(node: ts.Node) {
  return (
    ts.canHaveModifiers(node) &&
    (ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword) ?? false)
  );
}

export function isTopLevelDescribe(statement: ts.Statement): statement is ts.ExpressionStatement {
  return (
    ts.isExpressionStatement(statement) &&
    ts.isCallExpression(statement.expression) &&
    ts.isIdentifier(statement.expression.expression) &&
    statement.expression.expression.text === 'describe'
  );
}

export function isFunctionLike(node: ts.Node) {
  return (
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node)
  );
}

export function classMemberModifierToken(modifier: ts.Modifier): TraversalTokenName | undefined {
  if (modifier.kind === ts.SyntaxKind.PrivateKeyword) {
    return 'private';
  }
  if (modifier.kind === ts.SyntaxKind.ProtectedKeyword) {
    return 'protected';
  }
  if (modifier.kind === ts.SyntaxKind.PublicKeyword) {
    return 'public';
  }
  if (modifier.kind === ts.SyntaxKind.StaticKeyword) {
    return 'static';
  }
  return undefined;
}
