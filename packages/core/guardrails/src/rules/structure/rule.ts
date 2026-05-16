import { basename, extname, posix, relative } from 'node:path';
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
  private readonly variables = new Map<string, Set<string>>();

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
      const nodes = this.withoutExcludedNodes(await this.resolveRootNodes(traversal, rule), rule);
      this.captureExtracts(rule, nodes);
      this.checkAssertions(rule, nodes);
      this.checkExhaustiveContains(rule, nodes);
      await this.checkTraverse(traversal, rule, nodes);
    }
  }

  private rootRules() {
    const find = this.options.find ?? {};
    if (Array.isArray(find)) {
      return find;
    }

    return Object.entries(find).map(([pattern, rule]) => ({ ...rule, find: pattern }));
  }

  private async checkTraverse(traversal: CodeTraversal, rule: StructureFindRuleConfig, nodes: TraversalNode[]) {
    if (nodes.length === 0) {
      return;
    }

    for (const childRule of rule.traverse ?? []) {
      const childNodes = this.withoutExcludedNodes(
        await this.resolveChildNodes(traversal, childRule, nodes),
        childRule,
      );
      this.captureExtracts(childRule, childNodes);
      this.checkAssertions(childRule, childNodes);
      this.checkExhaustiveContains(childRule, childNodes);
      await this.checkTraverse(traversal, childRule, childNodes);
    }
  }

  private async resolveRootNodes(traversal: CodeTraversal, rule: StructureFindRuleConfig) {
    const nodes = this.uniqueNodes(
      (await Promise.all(this.findQueries(rule).map((query) => traversal.find(query)))).flat(),
    );
    return rule.invert ? traversal.invertSiblings(nodes) : nodes;
  }

  private async resolveChildNodes(traversal: CodeTraversal, rule: StructureFindRuleConfig, parents: TraversalNode[]) {
    const childGroups = await Promise.all(
      parents.map(async (parent) => {
        const nodes = this.uniqueNodes(
          (await Promise.all(this.findQueries(rule).map((query) => parent.find(query)))).flat(),
        );
        if (!rule.invert) {
          return nodes;
        }

        return nodes.length > 0 ? traversal.invertSiblings(nodes) : parent.find('*');
      }),
    );
    return this.uniqueNodes(childGroups.flat());
  }

  private findQueries(rule: StructureFindRuleConfig) {
    return Array.isArray(rule.find) ? rule.find : [rule.find];
  }

  private uniqueNodes(nodes: TraversalNode[]) {
    const seen = new Set<string>();
    return nodes.filter((node) => {
      const id = node.debugId();
      if (seen.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    });
  }

  private checkAssertions(rule: StructureRuleConfig, nodes: TraversalNode[]) {
    const assert = rule.assert ?? {};
    if (rule.allowEmpty && nodes.length === 0 && assert.exists === undefined) {
      return;
    }

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

  private captureExtracts(rule: StructureRuleConfig, nodes: TraversalNode[]) {
    if (rule.extract === undefined) {
      return;
    }

    for (const node of nodes) {
      for (const [name, template] of Object.entries(rule.extract)) {
        const variableName = name.replace(/^\$/, '');
        if (!this.variables.has(variableName)) {
          this.variables.set(variableName, new Set());
        }

        this.variables.get(variableName)?.add(this.expandNodeTemplate(node, template));
      }
    }
  }

  private checkExhaustiveContains(rule: StructureRuleConfig, nodes: TraversalNode[]) {
    for (const template of rule.exhaustiveContains ?? rule.exhaustivelyContains ?? []) {
      for (const expected of this.expandGlobalTemplate(template)) {
        const found = nodes.some((node) => {
          const text = this.optionalProperty(node, 'text');
          return typeof text === 'string' && text.includes(expected);
        });

        if (!found) {
          this.getReporter(this.nodePath(nodes[0])).fail(
            structureDiagnostic('exhaustiveContains', `Expected a selected node to contain ${expected}.`, rule),
          );
        }
      }
    }
  }

  private expandGlobalTemplate(template: string) {
    const variableName = this.variableName(template);
    if (variableName === null) {
      return [template];
    }

    return Array.from(this.variables.get(variableName) ?? []).map((value) =>
      template.replaceAll(`$${variableName}`, value),
    );
  }

  private expandNodeTemplate(node: TraversalNode, template: string) {
    return template.replaceAll(/\{\$(\w+)\}|\$(\w+)/g, (_match, braced: string, bare: string) => {
      return this.nodeVariable(node, braced ?? bare);
    });
  }

  private nodeVariable(node: TraversalNode, name: string) {
    if (name === 'name') {
      const nodeName = String(this.optionalProperty(node, 'name') ?? '');
      return extname(nodeName) ? basename(nodeName, extname(nodeName)) : nodeName;
    }

    return String(this.optionalProperty(node, name) ?? '');
  }

  private variableName(template: string) {
    const match = /\$(\w+)/.exec(template);
    return match?.[1] ?? null;
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

  private withoutExcludedNodes(nodes: TraversalNode[], rule: StructureRuleConfig) {
    const excludes = [...this.context.exclude, ...(rule.exclude ?? [])];
    if (excludes.length === 0) {
      return nodes;
    }

    return nodes.filter((node) => {
      const path = this.optionalProperty(node, 'path');
      return !(typeof path === 'string' && this.excluded(path, excludes));
    });
  }

  private excluded(path: string, excludes: string[]) {
    const relativePath = relative(this.context.packageDir, path).replaceAll('\\', '/');
    return excludes.some((excludePath) => this.matchesExclude(relativePath, excludePath));
  }

  private matchesExclude(path: string, excludePath: string) {
    const normalized = excludePath.replaceAll('\\', '/').replace(/\/$/, '');
    if (normalized.includes('*')) {
      return this.matchesGlob(path, normalized);
    }
    if (!posix.extname(normalized)) {
      return path === normalized || path.startsWith(`${normalized}/`);
    }
    return path === normalized;
  }

  private matchesGlob(path: string, pattern: string) {
    return new RegExp(this.globExpression(pattern)).test(path);
  }

  private globExpression(pattern: string) {
    let expression = '^';
    for (let index = 0; index < pattern.length; index++) {
      const char = pattern[index];
      const next = pattern[index + 1];
      const afterNext = pattern[index + 2];

      if (char === '*' && next === '*' && afterNext === '/') {
        expression += '(?:.*/)?';
        index += 2;
        continue;
      }
      if (char === '*' && next === '*') {
        expression += '.*';
        index += 1;
        continue;
      }
      if (char === '*') {
        expression += '[^/]*';
        continue;
      }

      expression += this.escapeRegExp(char ?? '');
    }
    return `${expression}$`;
  }

  private escapeRegExp(value: string) {
    return value.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
}
