import { extname } from 'node:path';
import ts from 'typescript';
import { pushRecord, recordFrom } from '../tree/record-utils';
import type {
  TraversalCacheExpandContext,
  TraversalNodeRecord,
  TraversalTokenName,
  TraversalTokenNodeInput,
} from '../types';

type ParameterOwnerNode =
  | ts.FunctionDeclaration
  | ts.FunctionExpression
  | ts.ArrowFunction
  | ts.MethodDeclaration
  | ts.ConstructorDeclaration
  | ts.GetAccessorDeclaration
  | ts.SetAccessorDeclaration;

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

  private translateStatement(
    sourceFile: ts.SourceFile,
    statement: ts.Statement,
    records: TraversalNodeRecord[],
  ): TraversalNodeRecord | undefined {
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
    if (ts.isIfStatement(statement)) {
      return this.ifRecord(sourceFile, statement, records);
    }
    if (ts.isTryStatement(statement)) {
      return this.tryRecord(sourceFile, statement, records);
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

  private translateDeclaration(
    sourceFile: ts.SourceFile,
    node: ts.Node,
    records: TraversalNodeRecord[],
  ): TraversalNodeRecord | undefined {
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
        this.parametersRecord(sourceFile, node, records).id,
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
        this.parametersRecord(sourceFile, node, records).id,
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
      return this.wrapClassMemberModifiers(sourceFile, node, method, records);
    }
    if (ts.isConstructorDeclaration(node)) {
      const children = [
        this.parametersRecord(sourceFile, node, records).id,
        ...this.blockRecord(sourceFile, node.body, records),
      ];
      const constructor = this.createTokenRecord(records, {
        sourceFile,
        node,
        token: 'constructor',
        name: 'constructor',
        childIds: children,
      });
      return this.wrapClassMemberModifiers(sourceFile, node, constructor, records);
    }
    if (ts.isPropertyDeclaration(node)) {
      const property = this.createTokenRecord(records, {
        sourceFile,
        node,
        token: 'const',
        name: node.name.getText(sourceFile),
        childIds: [],
      });
      return this.wrapClassMemberModifiers(sourceFile, node, property, records);
    }
    if (ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node)) {
      const children = [
        this.parametersRecord(sourceFile, node, records).id,
        ...this.blockRecord(sourceFile, node.body, records),
      ];
      const accessor = this.createTokenRecord(records, {
        sourceFile,
        node,
        token: 'function',
        name: node.name.getText(sourceFile),
        async: false,
        functionKind: 'method',
        childIds: children,
      });
      return this.wrapClassMemberModifiers(sourceFile, node, accessor, records);
    }

    return undefined;
  }

  private ifRecord(
    sourceFile: ts.SourceFile,
    node: ts.IfStatement,
    records: TraversalNodeRecord[],
  ): TraversalNodeRecord {
    return this.createTokenRecord(records, {
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

  private tryRecord(
    sourceFile: ts.SourceFile,
    node: ts.TryStatement,
    records: TraversalNodeRecord[],
  ): TraversalNodeRecord {
    return this.createTokenRecord(records, {
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
  ): string[] {
    if (!node) {
      return [];
    }

    return [
      this.createTokenRecord(records, {
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
      this.parametersRecord(sourceFile, node, records).id,
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

  private wrapClassMemberModifiers(
    sourceFile: ts.SourceFile,
    node: ts.Node,
    declaration: TraversalNodeRecord,
    records: TraversalNodeRecord[],
  ) {
    const modifiers = ts.canHaveModifiers(node) ? (ts.getModifiers(node) ?? []) : [];
    return modifiers.reduceRight((child, modifier) => {
      const token = this.classMemberModifierToken(modifier);
      if (!token) {
        return child;
      }

      return this.createTokenRecord(records, {
        sourceFile,
        node,
        token,
        name: token,
        childIds: [child.id],
      });
    }, declaration);
  }

  private classMemberModifierToken(modifier: ts.Modifier): TraversalTokenName | undefined {
    if (modifier.kind === ts.SyntaxKind.PrivateKeyword) {
      return 'private';
    }
    if (modifier.kind === ts.SyntaxKind.PublicKeyword) {
      return 'public';
    }
    if (modifier.kind === ts.SyntaxKind.StaticKeyword) {
      return 'static';
    }
    return undefined;
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
        destructured: this.isDestructuredParameter(parameter),
        childIds: this.parameterBindingRecords(sourceFile, parameter.name, records),
      }).id;
    });
  }

  private parametersRecord(
    sourceFile: ts.SourceFile,
    node: ParameterOwnerNode,
    records: TraversalNodeRecord[],
  ) {
    const childIds = this.parameterRecords(sourceFile, node.parameters, records);
    const range = this.parameterListRange(sourceFile, node);
    return this.createTokenRecord(records, {
      sourceFile,
      node,
      token: 'parameters',
      name: 'parameters',
      start: range.start,
      end: range.end,
      childIds,
    });
  }

  private parameterListRange(
    sourceFile: ts.SourceFile,
    node: ParameterOwnerNode,
  ) {
    if (node.parameters.length > 0) {
      const first = node.parameters[0];
      const last = node.parameters[node.parameters.length - 1];
      return { start: first.getStart(sourceFile), end: last.getEnd() };
    }

    const start = node.getStart(sourceFile);
    return { start, end: start };
  }

  private isDestructuredParameter(parameter: ts.ParameterDeclaration) {
    return ts.isObjectBindingPattern(parameter.name) || ts.isArrayBindingPattern(parameter.name);
  }

  private parameterBindingRecords(
    sourceFile: ts.SourceFile,
    name: ts.BindingName,
    records: TraversalNodeRecord[],
  ): string[] {
    if (ts.isObjectBindingPattern(name)) {
      return name.elements.map((element) => this.parameterBindingRecord(sourceFile, element, undefined, records).id);
    }
    if (ts.isArrayBindingPattern(name)) {
      return name.elements.flatMap((element, index) => {
        if (!ts.isBindingElement(element)) {
          return [];
        }
        return [this.parameterBindingRecord(sourceFile, element, String(index), records).id];
      });
    }

    return [];
  }

  private parameterBindingRecord(
    sourceFile: ts.SourceFile,
    node: ts.BindingElement,
    propertyName: string | undefined,
    records: TraversalNodeRecord[],
  ): TraversalNodeRecord {
    return this.createTokenRecord(records, {
      sourceFile,
      node,
      token: 'parameter-binding',
      name: node.name.getText(sourceFile),
      propertyName: node.propertyName?.getText(sourceFile) ?? propertyName ?? node.name.getText(sourceFile),
      childIds: this.parameterBindingRecords(sourceFile, node.name, records),
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

    const translated: TraversalNodeRecord | undefined = this.translateStatement(sourceFile, statement, records);
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
    const { sourceFile, node, token, name, async, destructured, functionKind, importPath, propertyName, childIds } =
      input;
    const start = input.start ?? node.getStart(sourceFile);
    const end = input.end ?? node.getEnd();
    const startPosition = sourceFile.getLineAndCharacterOfPosition(start);
    const endPosition = sourceFile.getLineAndCharacterOfPosition(end);
    const record = pushRecord(records, {
      id: '',
      kind: 'token',
      name,
      token,
      async,
      destructured,
      functionKind,
      importPath,
      propertyName,
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
