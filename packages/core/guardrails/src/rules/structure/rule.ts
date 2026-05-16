import { CodeTraversal, type TraversalNode } from '@two-pebble/traversal';
import { Guardrail } from '../../constructs/guardrail';
import { structureAssertions } from './assertions';
import { structureDiagnostic } from './errors';
import type { StructureConfig, StructureFindRuleConfig, StructureRuleConfig } from './types';

/**
 * Checks filesystem and translated-AST structure rules.
 */
export class Rule extends Guardrail<StructureConfig> {
  public readonly name = 'structure';

  /**
   * Runs every configured root query.
   * Nodes are resolved once per query before assertions run.
   * Child traversals are evaluated relative to each matched node set.
   */
  public async check() {
    const traversal = new CodeTraversal({
      rootPath: this.context.packageDir,
      cacheDirectory: this.options.cacheDirectory,
    });

    for (const rule of this.rootRules()) {
      const nodes = await traversal.find(rule.find);
      this.checkAssertions(rule, nodes);
      await this.checkTraverse(rule, nodes);
    }
  }

  private rootRules() {
    const find = this.options.find ?? {};
    if (Array.isArray(find)) {
      return find;
    }

    return Object.entries(find).map(([pattern, rule]) => ({ ...rule, find: pattern }));
  }

  private async checkTraverse(rule: StructureFindRuleConfig, nodes: TraversalNode[]) {
    for (const childRule of rule.traverse ?? []) {
      const childNodes = (await Promise.all(nodes.map((node) => node.find(childRule.find)))).flat();
      this.checkAssertions(childRule, childNodes);
      await this.checkTraverse(childRule, childNodes);
    }
  }

  private checkAssertions(rule: StructureRuleConfig, nodes: TraversalNode[]) {
    const assert = rule.assert ?? {};

    for (const assertion of structureAssertions()) {
      const value = assert[assertion.key];
      if (value === undefined) {
        continue;
      }

      for (const failure of assertion.evaluate(nodes, value as never)) {
        const reporter = this.getReporter(this.nodePath(failure.node));
        const diagnostic = structureDiagnostic(failure.assertion, failure.message, rule);
        const line = this.nodeLine(failure.node);
        if (line !== undefined) {
          reporter.failAtLine(diagnostic, line);
        } else {
          reporter.fail(diagnostic);
        }
      }
    }
  }

  private nodePath(node: TraversalNode | undefined) {
    const path = this.optionalProperty(node, 'path');
    return typeof path === 'string' ? path : this.context.packageDir;
  }

  private nodeLine(node: TraversalNode | undefined) {
    const line = this.optionalProperty(node, 'line');
    return typeof line === 'number' ? line : undefined;
  }

  private optionalProperty(node: TraversalNode | undefined, name: string) {
    try {
      return node?.property(name);
    } catch {
      return undefined;
    }
  }
}
