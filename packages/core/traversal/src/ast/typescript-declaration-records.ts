import ts from 'typescript';
import type { TraversalNodeRecord } from '../types';
import { classMemberModifierToken, hasExportModifier, importPath, reExportPath } from './typescript-node-utils';
import { createTokenRecord } from './typescript-token-records';

export function importRecord(
  sourceFile: ts.SourceFile,
  node: ts.ImportDeclaration | ts.ImportEqualsDeclaration,
  records: TraversalNodeRecord[],
) {
  return createTokenRecord(records, {
    sourceFile,
    node,
    token: 'import',
    name: 'import',
    importPath: importPath(sourceFile, node),
    childIds: [],
  });
}

export function reExportRecord(sourceFile: ts.SourceFile, node: ts.ExportDeclaration, records: TraversalNodeRecord[]) {
  return createTokenRecord(records, {
    sourceFile,
    node,
    token: 're-export',
    name: 're-export',
    importPath: reExportPath(sourceFile, node),
    childIds: [],
  });
}

export function wrapExport(
  sourceFile: ts.SourceFile,
  node: ts.Statement,
  declaration: TraversalNodeRecord | undefined,
  records: TraversalNodeRecord[],
) {
  if (!declaration || !hasExportModifier(node)) {
    return declaration;
  }

  const exported = createTokenRecord(records, {
    sourceFile,
    node,
    token: 'export',
    name: 'export',
    childIds: [declaration.id],
  });
  declaration.parentId = exported.id;
  return exported;
}

export function namedDeclarationRecord(
  sourceFile: ts.SourceFile,
  node: ts.InterfaceDeclaration | ts.TypeAliasDeclaration | ts.EnumDeclaration,
  records: TraversalNodeRecord[],
) {
  const token = ts.isInterfaceDeclaration(node) ? 'interface' : ts.isTypeAliasDeclaration(node) ? 'type' : 'enum';
  return createTokenRecord(records, { sourceFile, node, token, name: node.name.text, childIds: [] });
}

export function wrapClassMemberModifiers(
  sourceFile: ts.SourceFile,
  node: ts.Node,
  declaration: TraversalNodeRecord,
  records: TraversalNodeRecord[],
) {
  const modifiers = ts.canHaveModifiers(node) ? (ts.getModifiers(node) ?? []) : [];
  return modifiers.reduceRight((child, modifier) => {
    const token = classMemberModifierToken(modifier);
    return token ? createTokenRecord(records, { sourceFile, node, token, name: token, childIds: [child.id] }) : child;
  }, declaration);
}
