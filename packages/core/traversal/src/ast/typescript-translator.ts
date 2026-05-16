import { extname } from 'node:path';
import ts from 'typescript';
import type { TraversalCacheExpandContext, TraversalNodeRecord } from '../types';
import { awaitExpressionRecords } from './typescript-await';
import {
  importRecord,
  namedDeclarationRecord,
  reExportRecord,
  wrapClassMemberModifiers,
  wrapExport,
} from './typescript-declaration-records';
import { functionKind, isAsync, isFunctionLike, isTopLevelDescribe } from './typescript-node-utils';
import { parametersRecord } from './typescript-parameters';
import { createTokenRecord, leadingCommentRecords } from './typescript-token-records';

/**
 * Translates TypeScript source files into traversal token records.
 *
 * The translator owns syntax orchestration while specialized helpers own
 * parameter, comment, await, and token metadata details.
 */
export class TypescriptTranslator {
  public constructor(private readonly context: TraversalCacheExpandContext) {}

  public supports(path: string) {
    return path.endsWith('.ts') || path.endsWith('.tsx');
  }

  public translate(path: string, records: TraversalNodeRecord[]) {
    const sourceText = this.context.readFile(path).text;
    const scriptKind = extname(path) === '.tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const sourceFile = ts.createSourceFile(path, sourceText, ts.ScriptTarget.Latest, true, scriptKind);
    const childIds: string[] = [];

    for (const statement of sourceFile.statements) {
      childIds.push(...this.nodeCommentIds(sourceFile, statement, records));

      const translated = this.translateStatement(sourceFile, statement, records);
      if (translated) {
        childIds.push(translated.id);
      }
    }

    return childIds;
  }

  private translateStatement(
    sourceFile: ts.SourceFile,
    statement: ts.Statement,
    records: TraversalNodeRecord[],
  ): TraversalNodeRecord | undefined {
    if (ts.isImportDeclaration(statement) || ts.isImportEqualsDeclaration(statement)) {
      return importRecord(sourceFile, statement, records);
    }
    if (ts.isExportDeclaration(statement)) {
      return reExportRecord(sourceFile, statement, records);
    }
    if (isTopLevelDescribe(statement)) {
      return this.describeRecord(sourceFile, statement, records);
    }
    if (ts.isIfStatement(statement)) {
      return this.ifRecord(sourceFile, statement, records);
    }
    if (ts.isTryStatement(statement)) {
      return this.tryRecord(sourceFile, statement, records);
    }

    return wrapExport(sourceFile, statement, this.translateDeclaration(sourceFile, statement, records), records);
  }

  private translateDeclaration(
    sourceFile: ts.SourceFile,
    node: ts.Node,
    records: TraversalNodeRecord[],
  ): TraversalNodeRecord | undefined {
    if (ts.isClassDeclaration(node)) {
      return this.classRecord(sourceFile, node, records);
    }
    if (ts.isFunctionDeclaration(node)) {
      return this.functionDeclarationRecord(sourceFile, node, records);
    }
    if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node)) {
      return namedDeclarationRecord(sourceFile, node, records);
    }
    if (ts.isVariableStatement(node)) {
      return this.variableStatementRecord(sourceFile, node, records);
    }
    if (ts.isMethodDeclaration(node)) {
      return this.methodRecord(sourceFile, node, records);
    }
    if (ts.isConstructorDeclaration(node)) {
      return this.constructorRecord(sourceFile, node, records);
    }
    if (ts.isPropertyDeclaration(node)) {
      return this.propertyRecord(sourceFile, node, records);
    }
    if (ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node)) {
      return this.accessorRecord(sourceFile, node, records);
    }

    return undefined;
  }

  private classRecord(sourceFile: ts.SourceFile, node: ts.ClassDeclaration, records: TraversalNodeRecord[]) {
    return createTokenRecord(records, {
      sourceFile,
      node,
      token: 'class',
      name: node.name?.text ?? 'class',
      childIds: this.classChildRecords(sourceFile, node, records),
    });
  }

  private functionDeclarationRecord(
    sourceFile: ts.SourceFile,
    node: ts.FunctionDeclaration,
    records: TraversalNodeRecord[],
  ) {
    return createTokenRecord(records, {
      sourceFile,
      node,
      token: 'function',
      name: node.name?.text ?? 'function',
      async: isAsync(node),
      functionKind: 'declaration',
      childIds: this.functionChildIds(sourceFile, node, records),
    });
  }

  private variableStatementRecord(
    sourceFile: ts.SourceFile,
    node: ts.VariableStatement,
    records: TraversalNodeRecord[],
  ) {
    const declaration = node.declarationList.declarations[0];
    const name = declaration?.name.getText(sourceFile) ?? 'const';
    const childIds = declaration ? this.variableDeclarationChildren(sourceFile, declaration, records) : [];
    return createTokenRecord(records, { sourceFile, node, token: 'const', name, childIds });
  }

  private methodRecord(sourceFile: ts.SourceFile, node: ts.MethodDeclaration, records: TraversalNodeRecord[]) {
    const method = createTokenRecord(records, {
      sourceFile,
      node,
      token: 'function',
      name: node.name.getText(sourceFile),
      async: isAsync(node),
      functionKind: 'method',
      childIds: this.functionChildIds(sourceFile, node, records),
    });
    return wrapClassMemberModifiers(sourceFile, node, method, records);
  }

  private constructorRecord(
    sourceFile: ts.SourceFile,
    node: ts.ConstructorDeclaration,
    records: TraversalNodeRecord[],
  ) {
    const constructorRecord = createTokenRecord(records, {
      sourceFile,
      node,
      token: 'constructor',
      name: 'constructor',
      childIds: this.functionChildIds(sourceFile, node, records),
    });
    return wrapClassMemberModifiers(sourceFile, node, constructorRecord, records);
  }

  private propertyRecord(sourceFile: ts.SourceFile, node: ts.PropertyDeclaration, records: TraversalNodeRecord[]) {
    const property = createTokenRecord(records, {
      sourceFile,
      node,
      token: 'const',
      name: node.name.getText(sourceFile),
      childIds: [],
    });
    return wrapClassMemberModifiers(sourceFile, node, property, records);
  }

  private accessorRecord(
    sourceFile: ts.SourceFile,
    node: ts.GetAccessorDeclaration | ts.SetAccessorDeclaration,
    records: TraversalNodeRecord[],
  ) {
    const accessor = createTokenRecord(records, {
      sourceFile,
      node,
      token: 'accessor',
      name: node.name.getText(sourceFile),
      async: false,
      childIds: this.functionChildIds(sourceFile, node, records),
    });
    return wrapClassMemberModifiers(sourceFile, node, accessor, records);
  }

  private describeRecord(
    sourceFile: ts.SourceFile,
    node: ts.ExpressionStatement,
    records: TraversalNodeRecord[],
  ): TraversalNodeRecord {
    const expression = node.expression;
    const children = ts.isCallExpression(expression) ? this.describeChildRecords(sourceFile, expression, records) : [];
    return createTokenRecord(records, { sourceFile, node, token: 'describe', name: 'describe', childIds: children });
  }

  private describeChildRecords(sourceFile: ts.SourceFile, node: ts.CallExpression, records: TraversalNodeRecord[]) {
    const callback = node.arguments.find((argument) => isFunctionLike(argument));
    if (!callback || !('body' in callback)) {
      return [];
    }

    return ts.isBlock(callback.body) ? this.blockRecord(sourceFile, callback.body, records) : [];
  }

  private ifRecord(sourceFile: ts.SourceFile, node: ts.IfStatement, records: TraversalNodeRecord[]) {
    return createTokenRecord(records, {
      sourceFile,
      node,
      token: 'if',
      name: 'if',
      childIds: [
        ...this.statementRecord(sourceFile, node.thenStatement, records),
        ...this.statementRecord(sourceFile, node.elseStatement, records),
      ],
    });
  }

  private tryRecord(sourceFile: ts.SourceFile, node: ts.TryStatement, records: TraversalNodeRecord[]) {
    return createTokenRecord(records, {
      sourceFile,
      node,
      token: 'try',
      name: 'try',
      childIds: [
        ...this.blockRecord(sourceFile, node.tryBlock, records),
        ...this.catchClauseRecord(sourceFile, node.catchClause, records),
        ...this.blockRecord(sourceFile, node.finallyBlock, records),
      ],
    });
  }

  private catchClauseRecord(
    sourceFile: ts.SourceFile,
    node: ts.CatchClause | undefined,
    records: TraversalNodeRecord[],
  ) {
    if (!node) {
      return [];
    }

    return [
      createTokenRecord(records, {
        sourceFile,
        node,
        token: 'catch',
        name: 'catch',
        childIds: this.blockRecord(sourceFile, node.block, records),
      }).id,
    ];
  }

  private classChildRecords(sourceFile: ts.SourceFile, node: ts.ClassDeclaration, records: TraversalNodeRecord[]) {
    const childIds: string[] = [];
    for (const member of node.members) {
      childIds.push(...this.nodeCommentIds(sourceFile, member, records));

      const translated = this.translateDeclaration(sourceFile, member, records);
      if (translated) {
        childIds.push(translated.id);
      }
    }
    return childIds;
  }

  private variableDeclarationChildren(
    sourceFile: ts.SourceFile,
    node: ts.VariableDeclaration,
    records: TraversalNodeRecord[],
  ) {
    if (!node.initializer) {
      return [];
    }

    if (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) {
      return [this.functionLikeRecord(sourceFile, node.initializer, node.name.getText(sourceFile), records).id];
    }

    return awaitExpressionRecords(sourceFile, node.initializer, records);
  }

  private functionLikeRecord(
    sourceFile: ts.SourceFile,
    node: ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction | ts.MethodDeclaration,
    name: string,
    records: TraversalNodeRecord[],
  ) {
    return createTokenRecord(records, {
      sourceFile,
      node,
      token: 'function',
      name,
      async: isAsync(node),
      functionKind: functionKind(node),
      childIds: this.functionChildIds(sourceFile, node, records),
    });
  }

  private functionChildIds(
    sourceFile: ts.SourceFile,
    node:
      | ts.FunctionDeclaration
      | ts.FunctionExpression
      | ts.ArrowFunction
      | ts.MethodDeclaration
      | ts.ConstructorDeclaration
      | ts.GetAccessorDeclaration
      | ts.SetAccessorDeclaration,
    records: TraversalNodeRecord[],
  ) {
    return [parametersRecord(sourceFile, node, records).id, ...this.bodyRecord(sourceFile, node.body, records)];
  }

  private blockRecord(sourceFile: ts.SourceFile, block: ts.Block | undefined, records: TraversalNodeRecord[]) {
    return block
      ? [
          createTokenRecord(records, {
            sourceFile,
            node: block,
            token: 'block',
            name: 'block',
            childIds: this.blockChildRecords(sourceFile, block, records),
          }).id,
        ]
      : [];
  }

  private statementRecord(
    sourceFile: ts.SourceFile,
    statement: ts.Statement | undefined,
    records: TraversalNodeRecord[],
  ): string[] {
    if (!statement) {
      return [];
    }
    if (ts.isBlock(statement)) {
      return this.blockRecord(sourceFile, statement, records);
    }

    const translated = this.translateStatement(sourceFile, statement, records);
    return translated ? [translated.id] : [];
  }

  private bodyRecord(
    sourceFile: ts.SourceFile,
    body: ts.Block | ts.Expression | undefined,
    records: TraversalNodeRecord[],
  ) {
    if (!body) {
      return [];
    }
    return ts.isBlock(body)
      ? this.blockRecord(sourceFile, body, records)
      : awaitExpressionRecords(sourceFile, body, records);
  }

  private blockChildRecords(sourceFile: ts.SourceFile, block: ts.Block, records: TraversalNodeRecord[]) {
    const childIds: string[] = [];
    for (const statement of block.statements) {
      childIds.push(...this.nodeCommentIds(sourceFile, statement, records));

      const translated = this.translateStatement(sourceFile, statement, records);
      childIds.push(...(translated ? [translated.id] : awaitExpressionRecords(sourceFile, statement, records)));
    }
    return childIds;
  }

  private nodeCommentIds(sourceFile: ts.SourceFile, node: ts.Node, records: TraversalNodeRecord[]) {
    return leadingCommentRecords(sourceFile, node, records).map((comment) => comment.id);
  }
}
