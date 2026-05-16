import { extname } from 'node:path';
import ts from 'typescript';
import { pushRecord, recordFrom } from '../tree/record-utils';
import type {
  TraversalCacheExpandContext,
  TraversalNodeRecord,
  TraversalTokenName,
  TraversalTokenNodeInput,
} from '../types';

export class TypeScriptTranslator {
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
      for (const comment of this.leadingCommentRecords(sourceFile, statement, records)) {
        childIds.push(comment.id);
      }

      const translated = this.translateStatement(sourceFile, statement, records);
      if (translated) {
        childIds.push(translated.id);
      }
    }

    return childIds;
  }

  private translateStatement(sourceFile: ts.SourceFile, statement: ts.Statement, records: TraversalNodeRecord[]) {
    if (ts.isImportDeclaration(statement) || ts.isImportEqualsDeclaration(statement)) {
      return this.createTokenRecord(records, {
        sourceFile,
        node: statement,
        token: 'import',
        name: 'import',
        importPath: this.importPath(sourceFile, statement),
        childIds: [],
      });
    }

    const declaration = this.translateDeclaration(sourceFile, statement, records);
    if (!declaration || !this.hasExportModifier(statement)) {
      return declaration;
    }

    const exported = this.createTokenRecord(records, {
      sourceFile,
      node: statement,
      token: 'export',
      name: 'export',
      childIds: [declaration.id],
    });
    declaration.parentId = exported.id;
    return exported;
  }

  private translateDeclaration(sourceFile: ts.SourceFile, node: ts.Node, records: TraversalNodeRecord[]) {
    if (ts.isClassDeclaration(node)) {
      const children = this.classChildRecords(sourceFile, node, records);
      return this.createTokenRecord(records, {
        sourceFile,
        node,
        token: 'class',
        name: node.name?.text ?? 'class',
        childIds: children,
      });
    }
    if (ts.isFunctionDeclaration(node)) {
      const children = [
        ...this.parameterRecords(sourceFile, node.parameters, records),
        ...this.blockRecord(sourceFile, node.body, records),
      ];
      return this.createTokenRecord(records, {
        sourceFile,
        node,
        token: 'function',
        name: node.name?.text ?? 'function',
        async: this.isAsync(node),
        functionKind: 'declaration',
        childIds: children,
      });
    }
    if (ts.isInterfaceDeclaration(node)) {
      return this.createTokenRecord(records, {
        sourceFile,
        node,
        token: 'interface',
        name: node.name.text,
        childIds: [],
      });
    }
    if (ts.isVariableStatement(node)) {
      const declaration = node.declarationList.declarations[0];
      const name = declaration?.name.getText(sourceFile) ?? 'const';
      const childIds = declaration ? this.variableDeclarationChildren(sourceFile, declaration, records) : [];
      return this.createTokenRecord(records, { sourceFile, node, token: 'const', name, childIds });
    }
    if (ts.isMethodDeclaration(node)) {
      const children = [
        ...this.parameterRecords(sourceFile, node.parameters, records),
        ...this.blockRecord(sourceFile, node.body, records),
      ];
      const method = this.createTokenRecord(records, {
        sourceFile,
        node,
        token: 'function',
        name: node.name.getText(sourceFile),
        async: this.isAsync(node),
        functionKind: 'method',
        childIds: children,
      });
      return this.wrapVisibilityModifier(sourceFile, node, method, records);
    }

    return undefined;
  }

  private classChildRecords(sourceFile: ts.SourceFile, node: ts.ClassDeclaration, records: TraversalNodeRecord[]) {
    const childIds: string[] = [];
    for (const member of node.members) {
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

    return this.awaitExpressionRecords(sourceFile, node.initializer, records);
  }

  private functionLikeRecord(
    sourceFile: ts.SourceFile,
    node: ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction | ts.MethodDeclaration,
    name: string,
    records: TraversalNodeRecord[],
  ) {
    const children = [
      ...this.parameterRecords(sourceFile, node.parameters, records),
      ...this.bodyRecord(sourceFile, node.body, records),
    ];
    return this.createTokenRecord(records, {
      sourceFile,
      node,
      token: 'function',
      name,
      async: this.isAsync(node),
      functionKind: this.functionKind(node),
      childIds: children,
    });
  }

  private wrapVisibilityModifier(
    sourceFile: ts.SourceFile,
    node: ts.Node,
    declaration: TraversalNodeRecord,
    records: TraversalNodeRecord[],
  ) {
    const modifiers = ts.canHaveModifiers(node) ? (ts.getModifiers(node) ?? []) : [];
    const modifier = modifiers.find((candidate) => {
      return candidate.kind === ts.SyntaxKind.PrivateKeyword || candidate.kind === ts.SyntaxKind.PublicKeyword;
    });

    if (!modifier) {
      return declaration;
    }

    const token = modifier.kind === ts.SyntaxKind.PrivateKeyword ? 'private' : 'public';
    return this.createTokenRecord(records, {
      sourceFile,
      node,
      token,
      name: token,
      childIds: [declaration.id],
    });
  }

  private parameterRecords(
    sourceFile: ts.SourceFile,
    parameters: ts.NodeArray<ts.ParameterDeclaration>,
    records: TraversalNodeRecord[],
  ) {
    return parameters.map((parameter) => {
      return this.createTokenRecord(records, {
        sourceFile,
        node: parameter,
        token: 'parameter',
        name: parameter.name.getText(sourceFile),
        childIds: [],
      }).id;
    });
  }

  private blockRecord(sourceFile: ts.SourceFile, block: ts.Block | undefined, records: TraversalNodeRecord[]) {
    return block
      ? [
          this.createTokenRecord(records, {
            sourceFile,
            node: block,
            token: 'block',
            name: 'block',
            childIds: this.blockChildRecords(sourceFile, block, records),
          }).id,
        ]
      : [];
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
      : this.awaitExpressionRecords(sourceFile, body, records);
  }

  private blockChildRecords(sourceFile: ts.SourceFile, block: ts.Block, records: TraversalNodeRecord[]) {
    const childIds: string[] = [];
    for (const statement of block.statements) {
      for (const comment of this.leadingCommentRecords(sourceFile, statement, records)) {
        childIds.push(comment.id);
      }

      const translated = this.translateStatement(sourceFile, statement, records);
      if (translated) {
        childIds.push(translated.id);
      } else {
        childIds.push(...this.awaitExpressionRecords(sourceFile, statement, records));
      }
    }
    return childIds;
  }

  private leadingCommentRecords(sourceFile: ts.SourceFile, node: ts.Node, records: TraversalNodeRecord[]) {
    const sourceText = sourceFile.getFullText();
    const comments = ts.getLeadingCommentRanges(sourceText, node.pos) ?? [];

    return comments.map((comment) => {
      const token: TraversalTokenName =
        comment.kind === ts.SyntaxKind.MultiLineCommentTrivia ? 'block-comment' : 'line-comment';
      const text = sourceText.slice(comment.pos, comment.end);
      const startPosition = sourceFile.getLineAndCharacterOfPosition(comment.pos);
      const endPosition = sourceFile.getLineAndCharacterOfPosition(comment.end);
      return pushRecord(records, {
        id: '',
        kind: 'token',
        name: token,
        token,
        path: sourceFile.fileName,
        text,
        commentContent: this.commentContent(text, token),
        line: startPosition.line + 1,
        startLine: startPosition.line + 1,
        startColumn: startPosition.character + 1,
        endLine: endPosition.line + 1,
        endColumn: endPosition.character + 1,
        start: comment.pos,
        end: comment.end,
        childIds: [],
      });
    });
  }

  private createTokenRecord(records: TraversalNodeRecord[], input: TraversalTokenNodeInput) {
    const { sourceFile, node, token, name, async, functionKind, importPath, childIds } = input;
    const start = node.getStart(sourceFile);
    const end = node.getEnd();
    const startPosition = sourceFile.getLineAndCharacterOfPosition(start);
    const endPosition = sourceFile.getLineAndCharacterOfPosition(end);
    const record = pushRecord(records, {
      id: '',
      kind: 'token',
      name,
      token,
      async,
      functionKind,
      importPath,
      path: sourceFile.fileName,
      text: sourceFile.text.slice(start, end),
      line: startPosition.line + 1,
      startLine: startPosition.line + 1,
      startColumn: startPosition.character + 1,
      endLine: endPosition.line + 1,
      endColumn: endPosition.character + 1,
      start,
      end,
      childIds,
    });

    for (const childId of childIds) {
      recordFrom(records, childId).parentId = record.id;
    }

    return record;
  }

  private hasExportModifier(node: ts.Node) {
    return (
      ts.canHaveModifiers(node) &&
      (ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false)
    );
  }

  private importPath(sourceFile: ts.SourceFile, node: ts.ImportDeclaration | ts.ImportEqualsDeclaration) {
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

  private functionKind(node: ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction | ts.MethodDeclaration) {
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

  private isAsync(node: ts.Node) {
    return (
      ts.canHaveModifiers(node) &&
      (ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword) ?? false)
    );
  }

  private awaitExpressionRecords(sourceFile: ts.SourceFile, node: ts.Node, records: TraversalNodeRecord[]) {
    const awaitIds: string[] = [];
    const visit = (candidate: ts.Node) => {
      if (candidate !== node && this.isFunctionLike(candidate)) {
        return;
      }
      if (ts.isAwaitExpression(candidate)) {
        awaitIds.push(
          this.createTokenRecord(records, {
            sourceFile,
            node: candidate,
            token: 'await',
            name: 'await',
            childIds: [],
          }).id,
        );
      }

      candidate.forEachChild(visit);
    };

    visit(node);
    return awaitIds;
  }

  private isFunctionLike(node: ts.Node) {
    return (
      ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node) ||
      ts.isMethodDeclaration(node)
    );
  }

  private commentContent(text: string, token: TraversalTokenName) {
    if (token === 'line-comment') {
      return text
        .split('\n')
        .map((line) => line.replace(/^\s*\/\/\s?/, ''))
        .join('\n')
        .trim();
    }

    return text
      .replace(/^\/\*+/, '')
      .replace(/\*\/$/, '')
      .split('\n')
      .map((line) => line.replace(/^\s*\*\s?/, '').trimEnd())
      .join('\n')
      .trim();
  }
}
