import { basename, extname } from 'node:path';
import ts from 'typescript';
import { WorkspaceNode } from './workspace-node';

/**
 * We need to take in a given source file and build a internal version of it in our own custom AST format
 * This format is setup to efficiently handle the type of queries we want to run against the codebase
 */

export class CodeAstBuilder {
  private readonly sourceFile: ts.SourceFile;
  private readonly customTree: WorkspaceNode;

  public constructor(sourceFile: ts.SourceFile) {
    this.sourceFile = sourceFile;
    const filename = basename(sourceFile.fileName);
    this.customTree = new WorkspaceNode('file').withData({
      path: sourceFile.fileName,
      filename,
      name: basename(filename, extname(filename)),
      fileContent: sourceFile.text,
    });
    this.applyRange(this.customTree, sourceFile);
  }

  public async build(): Promise<WorkspaceNode> {
    this.consumeFile(this.sourceFile);
    return this.customTree;
  }

  private consumeFile(sourceFile: ts.SourceFile) {
    for (const statement of sourceFile.statements) {
      for (const comment of this.consumeComments(statement)) {
        this.customTree.addChild(comment);
      }
      const node = this.consumeStatement(statement);
      if (node) {
        this.customTree.addChild(node);
      }
    }
  }

  private consumeStatement(statement: ts.Statement): WorkspaceNode | undefined {
    if (ts.isImportDeclaration(statement)) {
      return this.consumeImportDeclaration(statement);
    }
    if (ts.isExpressionStatement(statement)) {
      return this.consumeExpressionStatement(statement);
    }

    const declaration = this.consumeDeclaration(statement);
    if (!declaration) {
      return undefined;
    }

    if (this.hasModifier(statement, ts.SyntaxKind.ExportKeyword)) {
      const wrapper = new WorkspaceNode('export').addChild(declaration);
      return this.applyRange(wrapper, statement);
    }

    return declaration;
  }

  private consumeDeclaration(statement: ts.Statement): WorkspaceNode | undefined {
    if (ts.isFunctionDeclaration(statement)) {
      return this.consumeFunctionDeclaration(statement);
    }
    if (ts.isClassDeclaration(statement)) {
      return this.consumeClassDeclaration(statement);
    }
    if (ts.isInterfaceDeclaration(statement)) {
      return this.consumeInterfaceDeclaration(statement);
    }
    if (ts.isTypeAliasDeclaration(statement)) {
      return this.consumeTypeAliasDeclaration(statement);
    }
    if (ts.isVariableStatement(statement)) {
      return this.consumeVariableStatement(statement);
    }
    return undefined;
  }

  private consumeImportDeclaration(statement: ts.ImportDeclaration) {
    const node = new WorkspaceNode('import').withData({
      importingFrom: statement.moduleSpecifier.getText(this.sourceFile),
    });
    return this.applyRange(node, statement);
  }

  private consumeExpressionStatement(statement: ts.ExpressionStatement) {
    return this.consumeTestFrameworkCall(statement.expression);
  }

  private consumeFunctionDeclaration(statement: ts.FunctionDeclaration) {
    const node = new WorkspaceNode('function').withData({
      name: statement.name?.text ?? '',
      async: this.hasModifier(statement, ts.SyntaxKind.AsyncKeyword) ? 'true' : 'false',
    });
    this.applyRange(node, statement);
    node.addChild(this.consumeParameters(statement.parameters));
    if (statement.body) {
      node.addChild(this.consumeBlock(statement.body));
    }
    return node;
  }

  private consumeClassDeclaration(statement: ts.ClassDeclaration) {
    const node = new WorkspaceNode('class').withData({
      name: statement.name?.text ?? '',
    });
    this.applyRange(node, statement);
    for (const member of statement.members) {
      for (const comment of this.consumeComments(member)) {
        node.addChild(comment);
      }
      const memberNode = this.consumeClassMember(member);
      if (memberNode) {
        node.addChild(memberNode);
      }
    }
    return node;
  }

  private consumeInterfaceDeclaration(statement: ts.InterfaceDeclaration) {
    const node = new WorkspaceNode('interface').withData({ name: statement.name.text });
    return this.applyRange(node, statement);
  }

  private consumeTypeAliasDeclaration(statement: ts.TypeAliasDeclaration) {
    const node = new WorkspaceNode('type').withData({ name: statement.name.text });
    return this.applyRange(node, statement);
  }

  private consumeVariableStatement(statement: ts.VariableStatement) {
    const declaration = statement.declarationList.declarations[0];
    const name = declaration?.name.getText(this.sourceFile) ?? '';
    const node = new WorkspaceNode('const').withData({ name });
    this.applyRange(node, statement);
    if (declaration?.initializer) {
      const fn = this.consumeFunctionExpression(declaration.initializer, name);
      if (fn) {
        node.addChild(fn);
      }
    }
    return node;
  }

  private consumeFunctionExpression(expression: ts.Expression, name: string): WorkspaceNode | undefined {
    if (!ts.isArrowFunction(expression) && !ts.isFunctionExpression(expression)) {
      return undefined;
    }
    const node = new WorkspaceNode('function').withData({
      name,
      async: this.hasModifier(expression, ts.SyntaxKind.AsyncKeyword) ? 'true' : 'false',
    });
    this.applyRange(node, expression);
    node.addChild(this.consumeParameters(expression.parameters));
    if (ts.isBlock(expression.body)) {
      node.addChild(this.consumeBlock(expression.body));
    }
    return node;
  }

  private consumeClassMember(member: ts.ClassElement): WorkspaceNode | undefined {
    const memberNode = this.consumeClassMemberInner(member);
    if (!memberNode) {
      return undefined;
    }
    return this.wrapWithModifiers(member, memberNode);
  }

  private consumeClassMemberInner(member: ts.ClassElement): WorkspaceNode | undefined {
    if (ts.isConstructorDeclaration(member)) {
      const node = new WorkspaceNode('constructor').withData({ name: 'constructor' });
      this.applyRange(node, member);
      node.addChild(this.consumeParameters(member.parameters));
      if (member.body) {
        node.addChild(this.consumeBlock(member.body));
      }
      return node;
    }
    if (ts.isMethodDeclaration(member)) {
      const node = new WorkspaceNode('function').withData({
        name: member.name.getText(this.sourceFile),
        async: this.hasModifier(member, ts.SyntaxKind.AsyncKeyword) ? 'true' : 'false',
      });
      this.applyRange(node, member);
      node.addChild(this.consumeParameters(member.parameters));
      if (member.body) {
        node.addChild(this.consumeBlock(member.body));
      }
      return node;
    }
    if (ts.isPropertyDeclaration(member)) {
      const node = new WorkspaceNode('const').withData({ name: member.name.getText(this.sourceFile) });
      return this.applyRange(node, member);
    }
    return undefined;
  }

  private wrapWithModifiers(node: ts.Node, target: WorkspaceNode): WorkspaceNode {
    let result = target;
    if (this.hasModifier(node, ts.SyntaxKind.StaticKeyword)) {
      result = new WorkspaceNode('static').addChild(result);
      this.applyRange(result, node);
    }
    if (this.hasModifier(node, ts.SyntaxKind.PrivateKeyword)) {
      result = new WorkspaceNode('private').addChild(result);
      this.applyRange(result, node);
    } else if (this.hasModifier(node, ts.SyntaxKind.PublicKeyword)) {
      result = new WorkspaceNode('public').addChild(result);
      this.applyRange(result, node);
    }
    return result;
  }

  private consumeParameters(parameters: ts.NodeArray<ts.ParameterDeclaration>): WorkspaceNode {
    const node = new WorkspaceNode('parameters');
    for (const parameter of parameters) {
      const parameterNode = new WorkspaceNode('parameter').withData({
        name: parameter.name.getText(this.sourceFile),
      });
      this.applyRange(parameterNode, parameter);
      node.addChild(parameterNode);
    }
    if (parameters.length > 0) {
      const first = parameters[0];
      const last = parameters[parameters.length - 1];
      if (first && last) {
        node.withRange(this.lineOf(first.getStart(this.sourceFile)), this.lineOf(last.getEnd()));
      }
    }
    return node;
  }

  private consumeBlock(block: ts.Block): WorkspaceNode {
    const node = new WorkspaceNode('block');
    this.applyRange(node, block);
    for (const awaitNode of this.collectAwaits(block)) {
      node.addChild(awaitNode);
    }
    for (const testNode of this.collectTestFrameworkCalls(block)) {
      node.addChild(testNode);
    }
    return node;
  }

  private consumeTestFrameworkCall(expression: ts.Expression): WorkspaceNode | undefined {
    if (!ts.isCallExpression(expression) || !ts.isIdentifier(expression.expression)) {
      return undefined;
    }
    const callName = expression.expression.text;
    const type = this.testFrameworkNodeType(callName);
    if (!type) {
      return undefined;
    }
    const node = new WorkspaceNode(type).withData({
      name: this.firstStringArgument(expression),
      callName,
    });
    this.applyRange(node, expression);
    if (type === 'describe') {
      for (const child of this.collectDescribeChildren(expression)) {
        node.addChild(child);
      }
    }
    return node;
  }

  private collectDescribeChildren(expression: ts.CallExpression): WorkspaceNode[] {
    const callback = expression.arguments.find(
      (argument): argument is ts.ArrowFunction | ts.FunctionExpression =>
        ts.isArrowFunction(argument) || ts.isFunctionExpression(argument),
    );
    if (!callback || !ts.isBlock(callback.body)) {
      return [];
    }
    return this.collectTestFrameworkCalls(callback.body);
  }

  private collectTestFrameworkCalls(root: ts.Node): WorkspaceNode[] {
    const calls: WorkspaceNode[] = [];
    const visit = (current: ts.Node) => {
      if (ts.isCallExpression(current)) {
        const node = this.consumeTestFrameworkCall(current);
        if (node) {
          calls.push(node);
          return;
        }
      }
      ts.forEachChild(current, visit);
    };
    ts.forEachChild(root, visit);
    return calls;
  }

  private testFrameworkNodeType(callName: string): 'describe' | 'test' | undefined {
    if (callName === 'describe') {
      return 'describe';
    }
    if (callName === 'test' || callName === 'it') {
      return 'test';
    }
    return undefined;
  }

  private firstStringArgument(expression: ts.CallExpression) {
    const [first] = expression.arguments;
    if (!first) {
      return '';
    }
    if (ts.isStringLiteral(first) || ts.isNoSubstitutionTemplateLiteral(first)) {
      return first.text;
    }
    if (ts.isTemplateExpression(first)) {
      return first.head.text;
    }
    return '';
  }

  private collectAwaits(node: ts.Node): WorkspaceNode[] {
    const awaits: WorkspaceNode[] = [];
    const visit = (current: ts.Node) => {
      if (ts.isAwaitExpression(current)) {
        const awaitNode = new WorkspaceNode('await');
        this.applyRange(awaitNode, current);
        awaits.push(awaitNode);
      }
      // Do not recurse into nested functions; their awaits belong to that function's block
      if (
        ts.isFunctionDeclaration(current) ||
        ts.isFunctionExpression(current) ||
        ts.isArrowFunction(current) ||
        ts.isMethodDeclaration(current)
      ) {
        return;
      }
      ts.forEachChild(current, visit);
    };
    ts.forEachChild(node, visit);
    return awaits;
  }

  private consumeComments(statement: ts.Node): WorkspaceNode[] {
    const fullText = this.sourceFile.getFullText();
    const ranges = ts.getLeadingCommentRanges(fullText, statement.getFullStart()) ?? [];
    const nodes: WorkspaceNode[] = [];
    for (const range of ranges) {
      if (range.kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
        continue;
      }
      nodes.push(new WorkspaceNode('block-comment').withRange(this.lineOf(range.pos), this.lineOf(range.end)));
    }
    return nodes;
  }

  private applyRange(target: WorkspaceNode, node: ts.Node) {
    target.withRange(this.lineOf(node.getStart(this.sourceFile)), this.lineOf(node.getEnd()));
    return target;
  }

  private lineOf(position: number) {
    return this.sourceFile.getLineAndCharacterOfPosition(position).line + 1;
  }

  private hasModifier(node: ts.Node, kind: ts.SyntaxKind) {
    return ts.canHaveModifiers(node) && (ts.getModifiers(node)?.some((modifier) => modifier.kind === kind) ?? false);
  }
}
