import ts from 'typescript';
import { Guardrail } from '../../constructs/guardrail';
import type { Reporter } from '../../reporter';
import { documentationErrors } from './errors';
import type {
  DocumentationRuleOptions,
  DocumentationStatementCheckInput,
  DocumentationStatementMatch,
  DocumentationStatementRule,
  TypescriptRuleInput,
} from './types';

/**
 * Enforces configured JSDoc requirements for matched TypeScript statements.
 */
export class Rule extends Guardrail<DocumentationRuleOptions> {
  public readonly name = 'documentation';

  /**
   * Checks TypeScript files against configured documentation statement rules.
   */
  public async check() {
    await this.forEachTypescriptFile((input) => {
      this.checkFile(input);
    });
  }

  private checkFile(input: TypescriptRuleInput) {
    for (const statementRule of this.statementRules()) {
      this.checkStatementRule({
        sourceText: input.sourceText,
        sourceFile: input.sourceFile,
        reporter: input.reporter,
        statementRule,
      });
    }
  }

  private checkStatementRule(input: DocumentationStatementCheckInput) {
    const visitNode = (node: ts.Node) => {
      if (
        this.matches(node, input.statementRule.match) &&
        !this.hasMultilineJSDoc(input.sourceText, node, input.statementRule.minimumJSDocLines ?? 3)
      ) {
        this.fail(input.reporter);
      }

      ts.forEachChild(node, visitNode);
    };

    visitNode(input.sourceFile);
  }

  private matches(node: ts.Node, match: DocumentationStatementMatch) {
    if (match === 'class') return ts.isClassDeclaration(node);
    if (match === 'publicClassMethod')
      return ts.isMethodDeclaration(node) && ts.isClassDeclaration(node.parent) && this.isPublic(node);
    if (match === 'function') return ts.isFunctionDeclaration(node);
    if (match === 'interface') return ts.isInterfaceDeclaration(node);
    if (match === 'type') return ts.isTypeAliasDeclaration(node);
    return false;
  }

  private hasMultilineJSDoc(sourceText: string, node: ts.Node, minimumLines: number) {
    const comments = ts.getLeadingCommentRanges(sourceText, node.getFullStart()) ?? [];
    return comments.some((comment) => {
      const text = sourceText.slice(comment.pos, comment.end);
      return text.startsWith('/**') && this.lineCount(text) >= minimumLines;
    });
  }

  private isPublic(member: ts.ClassElement) {
    return (
      !this.hasModifier(member, ts.SyntaxKind.PrivateKeyword) &&
      !this.hasModifier(member, ts.SyntaxKind.ProtectedKeyword)
    );
  }

  private hasModifier(node: ts.Node, kind: ts.SyntaxKind) {
    return ts.canHaveModifiers(node) && (ts.getModifiers(node)?.some((modifier) => modifier.kind === kind) ?? false);
  }

  private statementRules() {
    return this.options.statements ?? this.defaultStatementRules();
  }

  private defaultStatementRules(): DocumentationStatementRule[] {
    return [
      { match: 'class', minimumJSDocLines: 3 },
      { match: 'publicClassMethod', minimumJSDocLines: 3 },
    ];
  }

  private lineCount(sourceText: string) {
    return sourceText.split('\n').length;
  }

  private fail(reporter: Reporter) {
    reporter.fail({ error: 'missing-documentation', ...documentationErrors['missing-documentation'] });
  }
}
