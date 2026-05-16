import ts from 'typescript';
import type { TraversalNodeRecord } from '../types';
import { typescriptNodeUtils } from './typescript-node-utils';
import { typescriptTokenRecords } from './typescript-token-records';

export const typescriptDeclarationRecords = {
  importRecord(
    sourceFile: ts.SourceFile,
    node: ts.ImportDeclaration | ts.ImportEqualsDeclaration,
    records: TraversalNodeRecord[],
  ) {
    return typescriptTokenRecords.createTokenRecord(records, {
      sourceFile,
      node,
      token: 'import',
      name: 'import',
      importPath: typescriptNodeUtils.importPath(sourceFile, node),
      childIds: [],
    });
  },

  reExportRecord(sourceFile: ts.SourceFile, node: ts.ExportDeclaration, records: TraversalNodeRecord[]) {
    return typescriptTokenRecords.createTokenRecord(records, {
      sourceFile,
      node,
      token: 're-export',
      name: 're-export',
      importPath: typescriptNodeUtils.reExportPath(sourceFile, node),
      childIds: [],
    });
  },

  wrapExport(
    sourceFile: ts.SourceFile,
    node: ts.Statement,
    declaration: TraversalNodeRecord | undefined,
    records: TraversalNodeRecord[],
  ) {
    if (!declaration || !typescriptNodeUtils.hasExportModifier(node)) {
      return declaration;
    }

    const exported = typescriptTokenRecords.createTokenRecord(records, {
      sourceFile,
      node,
      token: 'export',
      name: 'export',
      childIds: [declaration.id],
    });
    declaration.parentId = exported.id;
    return exported;
  },

  namedDeclarationRecord(
    sourceFile: ts.SourceFile,
    node: ts.InterfaceDeclaration | ts.TypeAliasDeclaration | ts.EnumDeclaration,
    records: TraversalNodeRecord[],
  ) {
    const token = ts.isInterfaceDeclaration(node) ? 'interface' : ts.isTypeAliasDeclaration(node) ? 'type' : 'enum';
    return typescriptTokenRecords.createTokenRecord(records, {
      sourceFile,
      node,
      token,
      name: node.name.text,
      childIds: [],
    });
  },

  wrapClassMemberModifiers(
    sourceFile: ts.SourceFile,
    node: ts.Node,
    declaration: TraversalNodeRecord,
    records: TraversalNodeRecord[],
  ) {
    const modifiers = ts.canHaveModifiers(node) ? (ts.getModifiers(node) ?? []) : [];
    return modifiers.reduceRight((child, modifier) => {
      const token = typescriptNodeUtils.classMemberModifierToken(modifier);
      return token
        ? typescriptTokenRecords.createTokenRecord(records, {
            sourceFile,
            node,
            token,
            name: token,
            childIds: [child.id],
          })
        : child;
    }, declaration);
  },
};
