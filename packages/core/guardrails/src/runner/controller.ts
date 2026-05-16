import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { CodeTraversal, type WorkspaceNode } from '@two-pebble/traversal';
import { runAsserts } from '../asserts';
import type { AssertName } from '../asserts/types';
import { InvalidGuardrailConfigError, UnknownDefinitionError } from '../errors';
import type { CheckResult, Diagnostic, GuardrailConfig, RunResult, StructureRule } from '../types';
import { validateGuardrailConfig } from './config-validator';
import { parseGuardConfig } from './guard-config-parser';

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
      results.push(await this.runRule(traversal, packageDir, rule, filesScanned));
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
  ): Promise<CheckResult> {
    const ruleStart = performance.now();
    const queries = (Array.isArray(rule.find) ? rule.find : [rule.find]).map((query) =>
      this.absoluteFind(packageDir, query),
    );
    const resultSet = await traversal.find(queries);
    const nodes: WorkspaceNode[] = [];
    resultSet.forEach((node) => {
      nodes.push(node);
      const path = node.getProperty('path');
      if (path) {
        filesScanned.add(path);
      }
    });

    const diagnostics: Diagnostic[] = [];
    const findLabel = this.findLabel(rule.find);
    for (const { name, outcome } of runAsserts(nodes, rule.asserts)) {
      if (outcome.passed) {
        continue;
      }
      diagnostics.push({
        recommendation: rule.recommendation,
        description: outcome.description ?? `${name} assertion failed.`,
        find: findLabel,
        assertion: name as AssertName,
      });
    }

    return {
      find: findLabel,
      recommendation: rule.recommendation,
      passed: diagnostics.length === 0,
      diagnostics,
      durationMs: Math.round(performance.now() - ruleStart),
    };
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
