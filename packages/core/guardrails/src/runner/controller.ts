import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { InvalidGuardrailConfigError, UnknownDefinitionError } from '../errors';
import { StructureRunner } from '../structure/structure-runner';
import type { GuardrailConfig } from '../types';
import { validateGuardrailConfig } from './config-validator';

/**
 * Expands inherited structure config and runs it for one package.
 */
export class Controller {
  /**
   * Runs the configured structure checks against one package directory.
   */
  public async run(packageDir: string, config: GuardrailConfig) {
    validateGuardrailConfig(config);

    const merged = this.mergeInheritedConfig(packageDir, config);
    const totalStart = performance.now();
    const ruleStart = performance.now();
    const structureResult = await new StructureRunner(packageDir, merged).check();
    const reporters = structureResult.reporters;
    const diagnostics = reporters.flatMap((reporter) => reporter.diagnostics);
    const filesScanned = new Set(structureResult.filesScanned);

    for (const reporter of reporters) {
      if (reporter.file) {
        filesScanned.add(reporter.file);
      }
    }

    const results = [
      {
        rule: 'structure',
        passed: diagnostics.length === 0,
        diagnostics,
        filesScanned,
        durationMs: Math.round(performance.now() - ruleStart),
      },
    ];

    return {
      passed: results.every((result) => result.passed),
      results,
      totalDurationMs: Math.round(performance.now() - totalStart),
    };
  }

  private mergeInheritedConfig(packageDir: string, config: GuardrailConfig): GuardrailConfig {
    const definition = config.inherit ? this.findDefinitionConfig(packageDir, config.inherit) : undefined;
    return {
      cacheDirectory: config.cacheDirectory ?? definition?.cacheDirectory,
      exclude: [...(definition?.exclude ?? []), ...(config.exclude ?? [])],
      rules: [...(definition?.rules ?? []), ...(config.rules ?? [])],
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
}
