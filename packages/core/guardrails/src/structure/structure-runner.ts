import { basename, extname, posix, relative } from 'node:path';
import { CodeTraversal, type TraversalNode } from '@two-pebble/traversal';
import { Reporter } from '../reporter';
import { structureRules } from '../rules/registry';
import type { GuardrailConfig, StructureFindRuleConfig, StructureRuleConfig } from '../types';
import { structureDiagnostic } from './diagnostic';

/**
 * Runs traversal-backed structure rules for a package.
 */
export class StructureRunner {
  private readonly reporters = new Map<string, Reporter>();
  private readonly scannedFiles = new Set<string>();
  private readonly variables = new Map<string, Set<string>>();
  private readonly packageDir: string;
  private readonly config: GuardrailConfig;

  public constructor(packageDir: string, config: GuardrailConfig) {
    this.packageDir = packageDir;
    this.config = config;
  }

  /**
   * Evaluates every configured structure query.
   */
  public async check() {
    const traversal = new CodeTraversal({
      rootPath: this.packageDir,
      cacheDirectory: this.config.cacheDirectory,
    });

    for (const rule of this.config.rules ?? []) {
      const nodes = this.withoutExcludedNodes(await this.resolveRootNodes(traversal, rule), rule);
      this.recordScannedFiles(nodes);
      this.captureExtracts(rule, nodes);
      this.checkRules(rule, nodes);
      this.checkExhaustiveContains(rule, nodes);
      await this.checkTraverse(traversal, rule, nodes);
    }

    return {
      reporters: [...this.reporters.values()],
      filesScanned: this.scannedFiles,
    };
  }

  private async checkTraverse(traversal: CodeTraversal, rule: StructureFindRuleConfig, nodes: TraversalNode[]) {
    if (nodes.length === 0) {
      return;
    }

    for (const childRule of rule.traverse ?? []) {
      if (childRule.rules?.count !== undefined) {
        for (const childNodes of await this.resolveChildNodeGroups(traversal, childRule, nodes)) {
          const filteredNodes = this.withoutExcludedNodes(childNodes, childRule);
          this.recordScannedFiles(filteredNodes);
          this.captureExtracts(childRule, filteredNodes);
          this.checkRules(childRule, filteredNodes);
          this.checkExhaustiveContains(childRule, filteredNodes);
          await this.checkTraverse(traversal, childRule, filteredNodes);
        }
      } else {
        const childNodes = this.withoutExcludedNodes(
          await this.resolveChildNodes(traversal, childRule, nodes),
          childRule,
        );
        this.recordScannedFiles(childNodes);
        this.captureExtracts(childRule, childNodes);
        this.checkRules(childRule, childNodes);
        this.checkExhaustiveContains(childRule, childNodes);
        await this.checkTraverse(traversal, childRule, childNodes);
      }
    }
  }

  private async resolveRootNodes(traversal: CodeTraversal, rule: StructureFindRuleConfig) {
    const nodes = this.uniqueNodes(
      (await Promise.all(this.findQueries(rule).map((query) => traversal.find(query)))).flat(),
    );
    return rule.invert ? traversal.invertSiblings(nodes) : nodes;
  }

  private async resolveChildNodes(traversal: CodeTraversal, rule: StructureFindRuleConfig, parents: TraversalNode[]) {
    const childGroups = await this.resolveChildNodeGroups(traversal, rule, parents);
    return this.uniqueNodes(childGroups.flat());
  }

  private async resolveChildNodeGroups(
    traversal: CodeTraversal,
    rule: StructureFindRuleConfig,
    parents: TraversalNode[],
  ) {
    return Promise.all(
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

  private checkRules(config: StructureRuleConfig, nodes: TraversalNode[]) {
    const rules = config.rules ?? {};
    if (config.allowEmpty && nodes.length === 0 && rules.exists === undefined) {
      return;
    }

    for (const rule of structureRules()) {
      const value = rules[rule.key];
      if (value === undefined) {
        continue;
      }

      for (const failure of rule.evaluate(nodes, value as never)) {
        const reporter = this.getReporter(this.nodePath(failure.node));
        const diagnostic = structureDiagnostic(failure.rule, failure.message, config);
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

  private getReporter(file: string) {
    const existing = this.reporters.get(file);
    if (existing) {
      return existing;
    }

    const reporter = new Reporter('structure', file);
    this.reporters.set(file, reporter);
    return reporter;
  }

  private recordScannedFiles(nodes: TraversalNode[]) {
    for (const node of nodes) {
      const path = this.optionalProperty(node, 'path');
      if (typeof path === 'string') {
        this.scannedFiles.add(path);
      }
    }
  }

  private nodePath(node: TraversalNode | undefined) {
    const path = this.optionalProperty(node, 'path');
    return typeof path === 'string' ? path : this.packageDir;
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
    const excludes = [...this.packageExcludes(), ...(rule.exclude ?? [])];
    if (excludes.length === 0) {
      return nodes;
    }

    return nodes.filter((node) => {
      const path = this.optionalProperty(node, 'path');
      return !(typeof path === 'string' && this.excluded(path, excludes));
    });
  }

  private packageExcludes() {
    return (this.config.exclude ?? [])
      .filter((entry) => entry.rules === undefined || entry.rules.some((rule) => this.isStructureRuleName(rule)))
      .flatMap((entry) => entry.paths);
  }

  private isStructureRuleName(rule: string) {
    return rule === '*' || rule === 'structure';
  }

  private excluded(path: string, excludes: string[]) {
    const relativePath = relative(this.packageDir, path).replaceAll('\\', '/');
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
      expression += this.escapeRegex(char);
    }

    return `${expression}$`;
  }

  private escapeRegex(char: string) {
    return /[\\^$.*+?()[\]{}|]/.test(char) ? `\\${char}` : char;
  }
}
