import { Guardrail } from '../../constructs/guardrail';
import { CodeStructurePointer } from './code-structure-pointer';
import { codeStructureDiagnostic } from './errors';
import type { CodeStructureConfig, CodeStructureErrorId, CodeStructureRuleConfig } from './types';

/**
 * Checks recursive structural conventions from code.guard.
 * Each rule resolves paths, checks them, then evaluates child rules.
 */
export class Rule extends Guardrail<CodeStructureConfig> {
  public readonly name = 'code-structure';
  private readonly variables = new Map<string, Set<string>>();

  /**
   * Runs each configured structure rule from the package root.
   * Child rules are evaluated from every matching pointer.
   */
  public async check() {
    const root = new CodeStructurePointer({ directory: this.context.packageDir });

    for (const rule of this.options.rules ?? []) {
      await this.checkRule(rule, root);
    }
  }

  private async checkRule(rule: CodeStructureRuleConfig, context: CodeStructurePointer) {
    const matches = await context.resolve(rule);

    this.checkExistence(rule, context, matches);
    const typedMatches = this.checkType(rule, matches);
    const selectedMatches = this.filterMatches(rule, typedMatches);
    this.checkFileName(rule, selectedMatches);
    this.captureExtracts(rule, selectedMatches);
    this.checkContains(rule, selectedMatches);
    this.checkExcludes(rule, selectedMatches);
    this.checkExhaustiveContains(rule, context, selectedMatches);
    this.checkAllowedImports(rule, selectedMatches);

    for (const match of selectedMatches) {
      for (const child of rule.rules ?? []) {
        await this.checkRule(child, match);
      }
    }
  }

  private checkExistence(
    rule: CodeStructureRuleConfig,
    context: CodeStructurePointer,
    matches: CodeStructurePointer[],
  ) {
    if (rule.existence === 'must-exist' && matches.length === 0) {
      this.fail(context.targetDirectory(), 'missing-path', rule);
    }

    if (rule.existence === 'must-not-exist') {
      for (const match of matches) {
        this.fail(match.path, 'forbidden-path', rule);
      }
    }
  }

  private checkType(rule: CodeStructureRuleConfig, matches: CodeStructurePointer[]) {
    if (!rule.type) {
      return matches;
    }

    const typedMatches: CodeStructurePointer[] = [];

    for (const match of matches) {
      const valid = rule.type === 'must-be-dir' ? match.isDirectory() : match.isFile();

      if (!valid) {
        this.fail(match.path, 'wrong-path-type', rule);
        continue;
      }

      typedMatches.push(match);
    }

    return typedMatches;
  }

  private checkContains(rule: CodeStructureRuleConfig, matches: CodeStructurePointer[]) {
    for (const expected of rule.contains ?? []) {
      for (const match of matches) {
        if (!match.isFile()) {
          this.fail(match.path, 'wrong-path-type', rule);
          continue;
        }

        if (!match.contains(expected)) {
          this.fail(match.path, 'missing-content', rule);
        }
      }
    }
  }

  private filterMatches(rule: CodeStructureRuleConfig, matches: CodeStructurePointer[]) {
    if (rule.where === undefined) {
      return matches;
    }

    return matches.filter((match) => match.matchesWhere(rule.where ?? {}));
  }

  private checkExcludes(rule: CodeStructureRuleConfig, matches: CodeStructurePointer[]) {
    for (const forbidden of rule.excludes ?? []) {
      for (const match of matches) {
        if (!match.isFile()) {
          this.fail(match.path, 'wrong-path-type', rule);
          continue;
        }

        if (match.contains(forbidden)) {
          this.fail(match.path, 'forbidden-content', rule);
        }
      }
    }
  }

  private checkFileName(rule: CodeStructureRuleConfig, matches: CodeStructurePointer[]) {
    if (rule.fileNameEndsWith === undefined) {
      return;
    }

    for (const match of matches) {
      if (!match.fileNameEndsWith(rule.fileNameEndsWith)) {
        this.fail(match.path, 'wrong-file-name', rule);
      }
    }
  }

  private checkExhaustiveContains(
    rule: CodeStructureRuleConfig,
    context: CodeStructurePointer,
    matches: CodeStructurePointer[],
  ) {
    for (const expectedTemplate of rule.exhaustiveContains ?? rule.exhaustivelyContains ?? []) {
      for (const expected of this.expandExhaustiveTemplate(context, expectedTemplate)) {
        const found = matches.some((match) => match.isFile() && match.contains(expected));

        if (!found) {
          this.fail(matches[0]?.path ?? context.targetDirectory(), 'missing-exhaustive-content', rule);
        }
      }
    }
  }

  private captureExtracts(rule: CodeStructureRuleConfig, matches: CodeStructurePointer[]) {
    if (rule.extract === undefined) {
      return;
    }

    for (const match of matches) {
      for (const item of match.extract(rule.extract)) {
        if (!this.variables.has(item.name)) {
          this.variables.set(item.name, new Set());
        }

        this.variables.get(item.name)?.add(item.value);
      }
    }
  }

  private expandExhaustiveTemplate(context: CodeStructurePointer, template: string) {
    const variableName = this.variableName(template);
    if (variableName === null) {
      return [context.expand(template)];
    }

    return Array.from(this.variables.get(variableName) ?? []).map((value) =>
      context.expand(template.replaceAll(`$${variableName}`, value)),
    );
  }

  private variableName(template: string) {
    const match = /\$(\w+)/.exec(template);
    return match?.[1] ?? null;
  }

  private checkAllowedImports(rule: CodeStructureRuleConfig, matches: CodeStructurePointer[]) {
    if (rule.allowedImports === undefined) {
      return;
    }

    for (const match of matches) {
      if (!match.isFile()) {
        this.fail(match.path, 'wrong-path-type', rule);
        continue;
      }

      for (const _specifier of match.importsOutside(rule.allowedImports)) {
        this.fail(match.path, 'forbidden-import', rule);
      }
    }
  }

  private fail(file: string, error: CodeStructureErrorId, rule: CodeStructureRuleConfig) {
    this.getReporter(file).fail(codeStructureDiagnostic(error, rule));
  }
}
