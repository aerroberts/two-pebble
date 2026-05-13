import { basename } from 'node:path';
import ts from 'typescript';
import { Guardrail } from '../../constructs/guardrail';
import type { Reporter } from '../../reporter';
import { topLevelDefinitionsErrors } from './errors';
import type {
  TopLevelDefinitionFileType,
  TopLevelDefinitionPolicy,
  TopLevelDefinitionsErrorId,
  TopLevelDefinitionsRuleOptions,
  TopLevelStatementKind,
  TypescriptRuleInput,
} from './types';

/**
 * Enforces configured top-level statement policies for different TypeScript file roles.
 */
export class Rule extends Guardrail<TopLevelDefinitionsRuleOptions> {
  public readonly name = 'top-level-definitions';

  /**
   * Checks every TypeScript file against each matching configured file role.
   */
  public async check() {
    await this.forEachTypescriptFile((input) => this.checkFile(input));
  }

  private checkFile(input: TypescriptRuleInput) {
    for (const fileType of this.matchingFileTypes(input)) {
      const policy = this.policyFor(fileType);
      this.checkTopLevelStatements(input.sourceFile, input.reporter, policy);
      this.checkNestedDefinitions(input.sourceFile, input.reporter, policy);
    }
  }

  private matchingFileTypes(input: TypescriptRuleInput): TopLevelDefinitionFileType[] {
    const fileName = basename(input.file);
    const fileTypes: TopLevelDefinitionFileType[] = [];

    if (input.file.endsWith('.test.ts')) fileTypes.push('testFile');
    if (fileName === 'index.ts') fileTypes.push('indexFile');
    if (fileName === 'types.ts') fileTypes.push('typesFile');
    if (!input.file.endsWith('.test.ts') && input.sourceFile.statements.some(ts.isClassDeclaration))
      fileTypes.push('classFile');

    return fileTypes.filter(
      (fileType) =>
        this.policyFor(fileType).allowedTopLevelStatements || this.policyFor(fileType).bannedNestedDefinitions,
    );
  }

  private checkTopLevelStatements(sourceFile: ts.SourceFile, reporter: Reporter, policy: TopLevelDefinitionPolicy) {
    const allowed = policy.allowedTopLevelStatements;
    if (!allowed) return;

    for (const statement of sourceFile.statements) {
      if (!this.isAllowedTopLevelStatement(statement, allowed)) {
        this.fail(reporter, 'top-level-definition');
      }
    }
  }

  private checkNestedDefinitions(sourceFile: ts.SourceFile, reporter: Reporter, policy: TopLevelDefinitionPolicy) {
    const banned = policy.bannedNestedDefinitions;
    if (!banned) return;

    const visitNode = (node: ts.Node) => {
      const kind = this.kindForDefinition(node);

      if (node !== sourceFile && kind && banned.includes(kind)) {
        this.fail(reporter, 'nested-definition');
      }

      ts.forEachChild(node, visitNode);
    };

    visitNode(sourceFile);
  }

  private isAllowedTopLevelStatement(statement: ts.Statement, allowed: TopLevelStatementKind[]) {
    const kind = this.kindForTopLevelStatement(statement);
    return Boolean(kind && allowed.includes(kind));
  }

  private kindForTopLevelStatement(statement: ts.Statement): TopLevelStatementKind | undefined {
    if (ts.isImportDeclaration(statement) || ts.isImportEqualsDeclaration(statement)) return 'import';
    if (ts.isExportDeclaration(statement)) return 'export';
    if (ts.isClassDeclaration(statement)) return 'class';
    if (ts.isFunctionDeclaration(statement)) return 'function';
    if (ts.isInterfaceDeclaration(statement)) return 'interface';
    if (ts.isTypeAliasDeclaration(statement)) return 'type';
    if (ts.isEnumDeclaration(statement)) return 'enum';
    if (ts.isVariableStatement(statement)) return 'const';
    if (this.isTopLevelDescribe(statement)) return 'describe';
    return undefined;
  }

  private kindForDefinition(node: ts.Node): TopLevelStatementKind | undefined {
    if (ts.isClassDeclaration(node)) return 'class';
    if (ts.isFunctionDeclaration(node)) return 'function';
    if (ts.isInterfaceDeclaration(node)) return 'interface';
    if (ts.isTypeAliasDeclaration(node)) return 'type';
    if (ts.isEnumDeclaration(node)) return 'enum';
    if (ts.isVariableStatement(node)) return 'const';
    return undefined;
  }

  private isTopLevelDescribe(statement: ts.Statement) {
    return (
      ts.isExpressionStatement(statement) &&
      ts.isCallExpression(statement.expression) &&
      ts.isIdentifier(statement.expression.expression) &&
      statement.expression.expression.text === 'describe'
    );
  }

  private policyFor(fileType: TopLevelDefinitionFileType) {
    return this.options.files?.[fileType] ?? this.defaultPolicyFor(fileType);
  }

  private defaultPolicyFor(fileType: TopLevelDefinitionFileType): TopLevelDefinitionPolicy {
    if (fileType === 'classFile') return { allowedTopLevelStatements: ['import', 'class'] };
    if (fileType === 'testFile')
      return {
        allowedTopLevelStatements: ['import', 'describe'],
        bannedNestedDefinitions: ['class', 'function', 'interface', 'type'],
      };
    if (fileType === 'indexFile') return { allowedTopLevelStatements: ['import', 'export'] };
    return { allowedTopLevelStatements: ['import', 'export', 'interface', 'type'] };
  }

  private fail(reporter: Reporter, error: TopLevelDefinitionsErrorId) {
    reporter.fail({ error, ...topLevelDefinitionsErrors[error] });
  }
}
