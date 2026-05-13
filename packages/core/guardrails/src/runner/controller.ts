import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { InvalidGuardrailConfigError, UnknownDefinitionError, UnknownRuleError } from '../errors';
import type { CheckResult, ExcludeList, GuardrailConfig, GuardrailContext, RuleConfig } from '../types';
import { validateGuardrailConfig } from './config-validator';
import { rules } from './registry';
import type { MergeableRuleConfig } from './types';

/**
 * Expands a guardrail config into concrete rule executions for one package.
 */
export class Controller {
  /**
   * Runs configured rules against one package directory.
   * Results are aggregated by rule for reporter formatting.
   */
  public async run(packageDir: string, config: GuardrailConfig) {
    validateGuardrailConfig(config);

    const ruleMap = new Map<string, RuleConfig>();

    if (config.inherit) {
      const definition = this.findDefinitionConfig(packageDir, config.inherit);

      for (const [ruleName, ruleConfig] of Object.entries(definition.additional ?? {})) {
        this.addRuleConfig(ruleMap, ruleName, ruleConfig);
      }
    }

    for (const [ruleName, ruleConfig] of Object.entries(config.additional ?? {})) {
      this.addRuleConfig(ruleMap, ruleName, ruleConfig);
    }

    const excludes = config.exclude ?? [];
    const results: CheckResult[] = [];
    const totalStart = performance.now();

    for (const [ruleName, ruleConfig] of ruleMap) {
      const registration = rules.find((ruleEntry) => ruleEntry.name === ruleName);
      if (!registration) {
        throw new UnknownRuleError(ruleName);
      }

      const context: GuardrailContext = {
        packageDir,
        exclude: this.getExcludesForRule(ruleName, excludes),
        options: ruleConfig,
      };

      const ruleStart = performance.now();
      const rule = registration.create(context);
      await rule.check();
      const reporters = rule.getReport();
      const durationMs = Math.round(performance.now() - ruleStart);
      const diagnostics = reporters.flatMap((reporter) => reporter.diagnostics);
      const filesScanned = new Set<string>();

      for (const reporter of reporters) {
        if (reporter.file) {
          filesScanned.add(reporter.file);
        }
      }

      results.push({
        rule: ruleName,
        passed: diagnostics.length === 0,
        diagnostics,
        filesScanned,
        durationMs,
      });
    }

    return {
      passed: results.every((result) => result.passed),
      results,
      totalDurationMs: Math.round(performance.now() - totalStart),
    };
  }

  private stripPrefix(name: string, prefix: string) {
    return name.startsWith(prefix) ? name.slice(prefix.length) : name;
  }

  private addRuleConfig(ruleMap: Map<string, RuleConfig>, ruleName: string, ruleConfig: RuleConfig) {
    const name = this.stripPrefix(ruleName, '@rule/');
    ruleMap.set(name, this.mergeRuleConfig(ruleMap.get(name), ruleConfig));
  }

  private mergeRuleConfig(existing: RuleConfig | undefined, next: RuleConfig): RuleConfig {
    if (existing === undefined) {
      return next;
    }

    const existingConfig = existing as MergeableRuleConfig;
    const nextConfig = next as MergeableRuleConfig;

    if (existingConfig.rules !== undefined && nextConfig.rules !== undefined) {
      return { ...existingConfig, ...nextConfig, rules: [...existingConfig.rules, ...nextConfig.rules] };
    }

    return next;
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
      return JSON.parse(readFileSync(path, 'utf-8')) as GuardrailConfig;
    } catch {
      throw new InvalidGuardrailConfigError(`Could not parse ${path} as JSON.`);
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

  private getExcludesForRule(ruleName: string, excludes: ExcludeList) {
    const paths: string[] = [];

    for (const entry of excludes) {
      if (entry.rules.some((pattern) => pattern === '*' || this.stripPrefix(pattern, '@rule/') === ruleName)) {
        paths.push(...entry.paths);
      }
    }

    return paths;
  }
}
