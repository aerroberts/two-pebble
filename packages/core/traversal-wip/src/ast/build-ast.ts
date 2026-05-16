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
    this.customTree = new WorkspaceNode('file').withData({
      path: sourceFile.fileName,
    });
  }

  public async build(): Promise<WorkspaceNode> {
    this.consumeFile(this.sourceFile);
    return this.customTree;
  }

  private consumeFile(sourceFile: ts.SourceFile) {
    for (const statement of sourceFile.statements) {
      const statementNode = this.consumeStatement(statement);

      // The statament might not be a type we care about
      if (statementNode) {
        this.customTree.addChild(statementNode);
      }
    }
  }

  private consumeStatement(statement: ts.Statement): WorkspaceNode | undefined {
    if (ts.isImportDeclaration(statement)) {
      return this.consumeImportDeclaration(statement);
    }

    const declaration = this.consumeDeclaration(statement);
    if (declaration && this.hasModifier(statement, ts.SyntaxKind.ExportKeyword)) {
      return new WorkspaceNode('export').addChild(declaration);
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
    return new WorkspaceNode('import').withData({
      importingFrom: statement.moduleSpecifier.getText(this.sourceFile),
    });
  }

  private consumeFunctionDeclaration(statement: ts.FunctionDeclaration) {
    const node = new WorkspaceNode('function').withData({
      name: statement.name?.text ?? '',
      async: this.hasModifier(statement, ts.SyntaxKind.AsyncKeyword) ? 'true' : 'false',
    });
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
    for (const member of statement.members) {
      const memberNode = this.consumeClassMember(member);
      if (memberNode) {
        node.addChild(memberNode);
      }
    }
    return node;
  }

  private consumeInterfaceDeclaration(statement: ts.InterfaceDeclaration) {
    return new WorkspaceNode('interface').withData({
      name: statement.name.text,
    });
  }

  private consumeTypeAliasDeclaration(statement: ts.TypeAliasDeclaration) {
    return new WorkspaceNode('type').withData({
      name: statement.name.text,
    });
  }

  private consumeVariableStatement(statement: ts.VariableStatement) {
    const declaration = statement.declarationList.declarations[0];
    const name = declaration?.name.getText(this.sourceFile) ?? '';
    const node = new WorkspaceNode('const').withData({ name });
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
      node.addChild(this.consumeParameters(member.parameters));
      if (member.body) {
        node.addChild(this.consumeBlock(member.body));
      }
      return node;
    }
    if (ts.isPropertyDeclaration(member)) {
      return new WorkspaceNode('const').withData({
        name: member.name.getText(this.sourceFile),
      });
    }
    return undefined;
  }

  private wrapWithModifiers(node: ts.Node, target: WorkspaceNode): WorkspaceNode {
    let result = target;
    if (this.hasModifier(node, ts.SyntaxKind.StaticKeyword)) {
      result = new WorkspaceNode('static').addChild(result);
    }
    if (this.hasModifier(node, ts.SyntaxKind.PrivateKeyword)) {
      result = new WorkspaceNode('private').addChild(result);
    } else if (this.hasModifier(node, ts.SyntaxKind.PublicKeyword)) {
      result = new WorkspaceNode('public').addChild(result);
    }
    return result;
  }

  private consumeParameters(parameters: ts.NodeArray<ts.ParameterDeclaration>): WorkspaceNode {
    const node = new WorkspaceNode('parameters');
    for (const parameter of parameters) {
      node.addChild(
        new WorkspaceNode('parameter').withData({
          name: parameter.name.getText(this.sourceFile),
        }),
      );
    }
    return node;
  }

  private consumeBlock(block: ts.Block): WorkspaceNode {
    const node = new WorkspaceNode('block');
    for (const awaitNode of this.collectAwaits(block)) {
      node.addChild(awaitNode);
    }
    return node;
  }

  private collectAwaits(node: ts.Node): WorkspaceNode[] {
    const awaits: WorkspaceNode[] = [];
    const visit = (current: ts.Node) => {
      if (ts.isAwaitExpression(current)) {
        awaits.push(new WorkspaceNode('await'));
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

  private hasModifier(node: ts.Node, kind: ts.SyntaxKind) {
    return ts.canHaveModifiers(node) && (ts.getModifiers(node)?.some((modifier) => modifier.kind === kind) ?? false);
  }
}
