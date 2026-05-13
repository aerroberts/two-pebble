import ts from 'typescript';
import { Guardrail } from '../../constructs/guardrail';
import type { Reporter } from '../../reporter';
import { definitionLengthErrors } from './errors';
import type {
  DefinitionLengthCheckInput,
  DefinitionLengthMatch,
  DefinitionLengthPolicy,
  DefinitionLengthRuleOptions,
  TypescriptRuleInput,
} from './types';

/**
 * Enforces configured line-count limits for matched definitions and control-flow blocks.
 */
export class Rule extends Guardrail<DefinitionLengthRuleOptions> {
  public readonly name = 'definition-length';

  /**
   * Checks TypeScript files against configured definition length policies.
   */
  public async check() {
    await this.forEachTypescriptFile((input) => {
      if ((this.options.excludeTestFiles ?? true) && input.file.endsWith('.test.ts')) {
        return;
      }
      this.checkFile(input);
    });
  }

  private checkFile(input: TypescriptRuleInput) {
    const visitNode = (node: ts.Node) => {
      for (const policy of this.definitionPolicies()) {
        if (this.matches(node, policy.match)) {
          this.checkDefinition({ sourceText: input.sourceText, node, reporter: input.reporter, policy });
        }
      }

      ts.forEachChild(node, visitNode);
    };

    visitNode(input.sourceFile);
  }

  private checkDefinition(input: DefinitionLengthCheckInput) {
    if (
      this.lineCount(input.sourceText.slice(input.node.getStart(), input.node.getEnd())) >
      (input.policy.maxLines ?? this.defaultMaxLinesFor(input.policy.match))
    ) {
      this.fail(input.reporter);
    }
  }

  private matches(node: ts.Node, match: DefinitionLengthMatch) {
    if (match === 'classMember') {
      return this.isClassMemberDefinition(node);
    }
    if (match === 'function') {
      return this.isFunctionDefinition(node);
    }
    if (match === 'ifStatement') {
      return ts.isIfStatement(node);
    }
    if (match === 'tryBlock') {
      return ts.isTryStatement(node);
    }
    if (match === 'catchBlock') {
      return ts.isCatchClause(node);
    }
    return false;
  }

  private isClassMemberDefinition(node: ts.Node) {
    return (
      ts.isMethodDeclaration(node) ||
      ts.isConstructorDeclaration(node) ||
      ts.isGetAccessorDeclaration(node) ||
      ts.isSetAccessorDeclaration(node)
    );
  }

  private isFunctionDefinition(node: ts.Node) {
    return ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node);
  }

  private definitionPolicies() {
    return this.options.definitions ?? this.defaultDefinitionPolicies();
  }

  private defaultDefinitionPolicies(): DefinitionLengthPolicy[] {
    return [
      { match: 'classMember', maxLines: 80 },
      { match: 'function', maxLines: 200 },
      { match: 'ifStatement', maxLines: 80 },
      { match: 'tryBlock', maxLines: 80 },
      { match: 'catchBlock', maxLines: 80 },
    ];
  }

  private defaultMaxLinesFor(match: DefinitionLengthMatch) {
    if (match === 'function') {
      return 200;
    }
    return 80;
  }

  private lineCount(sourceText: string) {
    return sourceText.split('\n').length;
  }

  private fail(reporter: Reporter) {
    reporter.fail({ error: 'definition-too-long', ...definitionLengthErrors['definition-too-long'] });
  }
}
