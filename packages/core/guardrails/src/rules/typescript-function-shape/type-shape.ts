import ts from 'typescript';

export interface SimpleTypeOptions {
  maxSimpleUnionMembers?: number;
}

export function isSimpleType(node: ts.TypeNode, options: SimpleTypeOptions): boolean {
  if (isSimpleKeyword(node)) return true;
  if (ts.isTypeReferenceNode(node)) return isSimpleTypeReference(node, options);
  if (ts.isArrayTypeNode(node)) return isSimpleType(node.elementType, options);
  if (ts.isUnionTypeNode(node)) {
    return (
      node.types.length <= maxSimpleUnionMembers(options) && node.types.every((type) => isSimpleType(type, options))
    );
  }

  return false;
}

function isSimpleKeyword(node: ts.TypeNode) {
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

function isSimpleTypeReference(node: ts.TypeReferenceNode, options: SimpleTypeOptions) {
  if (!isSimpleTypeName(node.typeName)) return false;
  if (node.typeArguments === undefined) return true;
  return node.typeArguments.every((type) => isSimpleGenericArgument(type, options));
}

function isSimpleGenericArgument(node: ts.TypeNode, options: SimpleTypeOptions): boolean {
  if (isSimpleKeyword(node)) return true;
  if (ts.isTypeReferenceNode(node)) return node.typeArguments === undefined && isSimpleTypeName(node.typeName);
  if (ts.isArrayTypeNode(node)) return isSimpleGenericArgument(node.elementType, options);
  if (ts.isUnionTypeNode(node)) {
    return (
      node.types.length <= maxSimpleUnionMembers(options) &&
      node.types.every((type) => isSimpleGenericArgument(type, options))
    );
  }

  return false;
}

function isSimpleTypeName(name: ts.EntityName) {
  return ts.isIdentifier(name) || ts.isQualifiedName(name);
}

function maxSimpleUnionMembers(options: SimpleTypeOptions) {
  return options.maxSimpleUnionMembers ?? 5;
}
