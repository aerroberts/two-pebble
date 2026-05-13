import { readFileSync } from 'node:fs';
import { posix } from 'node:path';
import { glob } from 'tinyglobby';
import ts from 'typescript';
import { Reporter } from '../reporter';
import type { FileCallback, GuardrailContext, RuleOptions, TypescriptFileCallback } from '../types';
import type { GlobOptions } from './types';

/**
 * Base class for one configured guardrail rule run.
 */
export abstract class Guardrail<TOptions extends object = RuleOptions> {
  public abstract readonly name: string;
  protected readonly context: GuardrailContext<TOptions>;
  protected readonly options: Readonly<TOptions>;
  private readonly ignoredPaths = ['**/node_modules/**', '**/fixtures/**', '**/__snapshots__/**', '**/snapshots/**'];
  private readonly reporters = new Map<string, Reporter>();

  public constructor(context: GuardrailContext<TOptions>) {
    this.context = context;
    this.options = context.options;
  }

  /**
   * Returns every reporter created during this rule run.
   * The controller uses this to aggregate final diagnostics.
   */
  public getReport() {
    return [...this.reporters.values()];
  }

  /**
   * Returns the stable reporter for a file path.
   * Reusing reporters keeps diagnostics grouped by file.
   */
  public getReporter(file: string) {
    const existing = this.reporters.get(file);
    if (existing) {
      return existing;
    }

    const reporter = new Reporter(this.name, file);
    this.reporters.set(file, reporter);
    return reporter;
  }

  /**
   * Iterates every non-ignored file in the package.
   * Rule implementations receive the file reporter with each path.
   */
  public async forEachFile(callback: FileCallback) {
    for (const file of await this.glob('**/*', { onlyDirectories: undefined })) {
      await callback(file, this.getReporter(file));
    }
  }

  /**
   * Iterates every non-ignored directory in the package.
   * Rule implementations receive the directory reporter with each path.
   */
  public async forEachDirectory(callback: FileCallback) {
    for (const directory of await this.glob('**/*', { onlyDirectories: true })) {
      await callback(directory, this.getReporter(directory));
    }
  }

  /**
   * Iterates TypeScript files with parsed source files.
   * Rules use this when they need AST-aware checks.
   */
  public async forEachTypescriptFile(callback: TypescriptFileCallback) {
    await this.forEachFile(async (file, reporter) => {
      if (!file.endsWith('.ts')) {
        return;
      }

      const sourceText = readFileSync(file, 'utf-8');
      const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true);
      await callback({ file, sourceText, sourceFile, reporter });
    });
  }

  /**
   * Iterates TSX files with parsed source files.
   * React rules use this when JSX-aware AST checks are needed.
   */
  public async forEachTsxFile(callback: TypescriptFileCallback) {
    await this.forEachFile(async (file, reporter) => {
      if (!file.endsWith('.tsx')) {
        return;
      }

      const sourceText = readFileSync(file, 'utf-8');
      const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      await callback({ file, sourceText, sourceFile, reporter });
    });
  }

  /**
   * Executes this guardrail rule once.
   * Implementations report failures through file reporters.
   */
  public abstract check(): Promise<void>;

  private glob(path: string, options: GlobOptions) {
    return glob(path, {
      absolute: true,
      cwd: this.context.packageDir,
      ignore: [...this.ignoredPaths, ...this.context.exclude.map((entry) => this.toGlob(entry))],
      onlyDirectories: options.onlyDirectories,
    });
  }

  private toGlob(path: string) {
    if (path.endsWith('/') || !posix.extname(path)) {
      return posix.join(path, '**');
    }

    return path;
  }
}
