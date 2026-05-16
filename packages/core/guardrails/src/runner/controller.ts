import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { CodeTraversal, type WorkspaceNode } from '@two-pebble/traversal';
import { runAsserts } from '../asserts';
import { InvalidGuardrailConfigError, UnknownDefinitionError } from '../errors';
import type {
  AssertName,
  CheckResult,
  CodeRule,
  Diagnostic,
  GuardrailConfig,
  RunResult,
  StructureRule,
} from '../types';
import { validateGuardrailConfig } from './config-validator';
import { leadingCommentsOf, parseGuardConfig } from './guard-config-parser';

/**
 * Expands inherited structure config and runs it for one package.
 */
export class Controller {
  /**
   * Runs the configured structure checks against one package directory.
   */
  public async run(packageDir: string, config: GuardrailConfig): Promise<RunResult> {
    validateGuardrailConfig(config);
    const merged = this.mergeInheritedConfig(packageDir, config);
    const totalStart = performance.now();
    const traversal = new CodeTraversal(packageDir);
    const filesScanned = new Set<string>();
    const results: CheckResult[] = [];

    for (const rule of merged.structure ?? []) {
      const ruleResults = await this.runRule(traversal, packageDir, rule, filesScanned);
      results.push(...ruleResults);
    }

    return {
      passed: results.every((result) => result.passed),
      results,
      filesScanned,
      totalDurationMs: Math.round(performance.now() - totalStart),
    };
  }

  private async runRule(
    traversal: CodeTraversal,
    packageDir: string,
    rule: StructureRule,
    filesScanned: Set<string>,
  ): Promise<CheckResult[]> {
    const ruleStart = performance.now();
    const queries = (Array.isArray(rule.find) ? rule.find : [rule.find]).map((query) =>
      this.absoluteFind(packageDir, query),
    );
    const resultSet = await traversal.find(queries);
    const nodes: WorkspaceNode[] = [];
    const matchedFiles: WorkspaceNode[] = [];
    resultSet.forEach((node) => {
      nodes.push(node);
      const path = node.getProperty('path');
      if (path) {
        filesScanned.add(path);
      }
      if (node.type === 'file') {
        matchedFiles.push(node);
      }
    });

    const findLabel = this.findLabel(rule.find);
    const recommendation = this.buildRecommendation(rule);
    const checks: CheckResult[] = [];

    // A rule with no asserts is purely a file selector for its `code` block;
    // we skip emitting a top-level check so it isn't reported as PASS noise.
    if (rule.asserts && Object.keys(rule.asserts).length > 0) {
      const diagnostics = this.diagnosticsFor(nodes, rule.asserts, findLabel, recommendation);
      checks.push({
        find: findLabel,
        recommendation,
        passed: diagnostics.length === 0,
        diagnostics,
        durationMs: Math.round(performance.now() - ruleStart),
      });
    }

    for (const codeRule of rule.code ?? []) {
      for (const fileNode of matchedFiles) {
        checks.push(await this.runCodeRule(traversal, packageDir, codeRule, rule, fileNode));
      }
    }

    return checks;
  }

  private async runCodeRule(
    traversal: CodeTraversal,
    packageDir: string,
    codeRule: CodeRule,
    parent: StructureRule,
    fileNode: WorkspaceNode,
  ): Promise<CheckResult> {
    const start = performance.now();
    const filePath = fileNode.getProperty('path') ?? '';
    const astQueries = Array.isArray(codeRule.find) ? codeRule.find : [codeRule.find];
    const queries = astQueries.map((astQuery) => `${this.ensureGlobPattern(filePath)}#${astQuery}`);
    const resultSet = await traversal.find(queries);
    const nodes: WorkspaceNode[] = [];
    resultSet.forEach((node) => {
      nodes.push(node);
    });

    const findLabel = `${relative(packageDir, filePath)}#${this.findLabel(codeRule.find)}`;
    const recommendation = this.buildRecommendation(parent, codeRule);
    const asserts = codeRule.asserts ?? {};
    const diagnostics = this.diagnosticsFor(nodes, asserts, findLabel, recommendation, filePath);

    return {
      find: findLabel,
      recommendation,
      passed: diagnostics.length === 0,
      diagnostics,
      durationMs: Math.round(performance.now() - start),
    };
  }

  private diagnosticsFor(
    nodes: WorkspaceNode[],
    asserts: NonNullable<StructureRule['asserts']>,
    find: string,
    recommendation: string,
    file?: string,
  ): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const { name, outcome } of runAsserts(nodes, asserts)) {
      if (outcome.passed) {
        continue;
      }
      diagnostics.push({
        recommendation,
        description: outcome.description ?? `${name} assertion failed.`,
        find,
        assertion: name as AssertName,
        file,
      });
    }
    return diagnostics;
  }

  // Builds a stack-trace style recommendation by walking outer-to-inner. For
  // each rule in the chain we add its leading comment (from the guard file)
  // followed by its `recommendation`. The result joins everything with
  // newlines so a failed assert surfaces the full authoring context.
  private buildRecommendation(rule: StructureRule, codeRule?: CodeRule) {
    const parts: string[] = [];
    parts.push(...leadingCommentsOf(rule));
    if (rule.recommendation) {
      parts.push(rule.recommendation);
    }
    if (codeRule) {
      parts.push(...leadingCommentsOf(codeRule));
      if (codeRule.recommendation) {
        parts.push(codeRule.recommendation);
      }
    }
    return parts.join('\n');
  }

  private absoluteFind(packageDir: string, query: string) {
    const [filePart, astPart] = query.split('#');
    const resolved = filePart && !filePart.startsWith('/') ? resolve(packageDir, filePart) : (filePart ?? '');
    const globReady = this.ensureGlobPattern(resolved);
    return astPart === undefined ? globReady : `${globReady}#${astPart}`;
  }

  // Node's fs.glob returns no matches for an exact path with no wildcards, so
  // we wrap the final segment in braces (a no-op pattern) when the caller
  // passed a literal path. That keeps simple `src/foo.ts` finds working.
  private ensureGlobPattern(path: string) {
    if (/[*?{[]/.test(path)) {
      return path;
    }
    const slash = path.lastIndexOf('/');
    if (slash === -1) {
      return `{${path}}`;
    }
    return `${path.slice(0, slash)}/{${path.slice(slash + 1)}}`;
  }

  private findLabel(find: string | string[]) {
    return Array.isArray(find) ? find.join(', ') : find;
  }

  private mergeInheritedConfig(packageDir: string, config: GuardrailConfig): GuardrailConfig {
    const definition = config.inherit ? this.findDefinitionConfig(packageDir, config.inherit) : undefined;
    return {
      structure: [...(definition?.structure ?? []), ...(config.structure ?? [])],
    };
  }

  private findDefinitionConfig(packageDir: string, definition: string) {
    const repoRoot = this.findRepoRoot(packageDir);
    for (const file of readdirSync(repoRoot)) {
      if (!file.endsWith('.guard') || file === 'code.guard') {
        continue;
      }
      const config = this.readGuardFile(resolve(repoRoot, file));
      validateGuardrailConfig(config);
      if (config.definition === definition) {
        return config;
      }
    }
    throw new UnknownDefinitionError(definition);
  }

  private readGuardFile(path: string) {
    try {
      return parseGuardConfig(readFileSync(path, 'utf-8'));
    } catch {
      throw new InvalidGuardrailConfigError(`Could not parse ${path} as comment JSON.`);
    }
  }

  private findRepoRoot(packageDir: string) {
    let current = resolve(packageDir);
    while (true) {
      if (this.hasWorkspacePackageJson(current)) {
        return current;
      }
      const parent = dirname(current);
      if (parent === current) {
        return resolve(packageDir);
      }
      current = parent;
    }
  }

  private hasWorkspacePackageJson(directory: string) {
    const path = resolve(directory, 'package.json');
    if (!existsSync(path)) {
      return false;
    }
    try {
      const value = JSON.parse(readFileSync(path, 'utf-8')) as { workspaces?: string[] };
      return Array.isArray(value.workspaces);
    } catch {
      return false;
    }
  }
}
