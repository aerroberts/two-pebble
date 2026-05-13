import { readFileSync, statSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { glob } from 'tinyglobby';
import ts from 'typescript';
import type {
  CodeStructureExtractConfig,
  CodeStructurePointerInput,
  CodeStructureRuleConfig,
  CodeStructureWhereConfig,
} from './types';

/**
 * Points at a path while carrying interpolation values.
 * Structure rules branch by resolving child pointers from this context.
 */
export class CodeStructurePointer {
  public readonly directory: string;
  public readonly path: string;
  private readonly values: Record<string, string>;

  public constructor(input: CodeStructurePointerInput) {
    this.directory = input.directory;
    this.path = input.path ?? input.directory;
    this.values = input.values ?? {};
  }

  /**
   * Resolves a structure rule relative to this pointer.
   * Each match receives inherited interpolation values.
   */
  public async resolve(rule: CodeStructureRuleConfig) {
    const pattern = this.interpolate(rule.match);
    const paths = await glob(this.toGlobPattern(pattern), {
      absolute: true,
      cwd: this.directory,
      dot: true,
      ignore: ['**/node_modules/**'],
      onlyFiles: false,
    });

    return paths.filter((path) => this.matchesLiteralBasename(path, pattern)).map((path) => this.createChild(path));
  }

  /**
   * Reports whether the pointer path is a directory.
   * Type checks use this before recursing into child rules.
   */
  public isDirectory() {
    return statSync(this.path).isDirectory();
  }

  /**
   * Reports whether the pointer path is a file.
   * Content checks use this before reading the path.
   */
  public isFile() {
    return statSync(this.path).isFile();
  }

  /**
   * Checks whether the pointed file contains text.
   * Non-file pointers never satisfy content assertions.
   */
  public contains(value: string) {
    return this.isFile() && readFileSync(this.path, 'utf-8').includes(value);
  }

  /**
   * Checks whether the file basename has a required suffix.
   * Directory names intentionally never pass this check.
   * Structure rules use this to make test and contract naming exact.
   */
  public fileNameEndsWith(value: string) {
    return this.isFile() && basename(this.path).endsWith(value);
  }

  /**
   * Returns whether this pointer satisfies a structural selector.
   * Selectors narrow matches before nested structure rules are evaluated.
   */
  public matchesWhere(where: CodeStructureWhereConfig) {
    if (where.fileNameMatchesParentDirectory === true && !this.fileNameMatchesParentDirectory()) {
      return false;
    }

    if (where.moduleKind === 'single-exported-function-module' && !this.isSingleExportedFunctionModule()) {
      return false;
    }

    return true;
  }

  /**
   * Extracts named values from this pointer for later cross-rule checks.
   * Config keys may include a leading "$" to mirror interpolation syntax.
   * Config values use the same interpolation values as match patterns.
   */
  public extract(config: CodeStructureExtractConfig) {
    return Object.entries(config).map(([name, value]) => ({
      name: name.replace(/^\$/, ''),
      value: this.interpolate(value),
    }));
  }

  /**
   * Expands a content template against this pointer's interpolation values.
   * Rule-level exhaustive checks use this before applying global variables.
   */
  public expand(value: string) {
    return this.interpolate(value);
  }

  /**
   * Returns import specifiers that are outside an allowed list.
   * Empty allowed lists intentionally reject every import in the file.
   */
  public importsOutside(allowedImports: string[]) {
    if (!this.isFile()) {
      return [];
    }

    return this.imports().filter((specifier) => !this.isAllowedImport(specifier, allowedImports));
  }

  /**
   * Returns the directory used to report missing child matches.
   * Files report their parent directory as the target.
   */
  public targetDirectory() {
    return this.isDirectory() ? this.path : dirname(this.path);
  }

  private createChild(path: string) {
    return new CodeStructurePointer({
      path,
      directory: statSync(path).isDirectory() ? path : dirname(path),
      values: { ...this.values, name: this.getName(path) },
    });
  }

  private interpolate(pattern: string) {
    return pattern.replaceAll(/\{\$(\w+)\}|\$(\w+)/g, (_match, braced: string, bare: string) => {
      return this.values[braced ?? bare] ?? '';
    });
  }

  private getName(path: string) {
    const name = basename(path);
    return statSync(path).isDirectory() ? name : name.replace(/\.[^.]+$/, '');
  }

  private fileNameMatchesParentDirectory() {
    if (!this.isFile()) {
      return false;
    }

    return this.getName(this.path) === basename(dirname(this.path));
  }

  private isSingleExportedFunctionModule() {
    if (!this.isFile()) {
      return false;
    }

    const sourceFile = this.sourceFile();
    let exportedFunctions = 0;

    for (const statement of sourceFile.statements) {
      if (this.isExportedFunctionStatement(statement)) {
        exportedFunctions += 1;
      }
    }

    return exportedFunctions === 1;
  }

  private isExportedFunctionStatement(statement: ts.Statement) {
    if (ts.isFunctionDeclaration(statement)) {
      return this.hasExportModifier(statement);
    }

    if (ts.isVariableStatement(statement) && this.hasExportModifier(statement)) {
      return statement.declarationList.declarations.some((declaration) => {
        return (
          declaration.initializer !== undefined &&
          (ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer))
        );
      });
    }

    return false;
  }

  private hasExportModifier(node: ts.Node) {
    return (
      ts.canHaveModifiers(node) &&
      (ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false)
    );
  }

  private toGlobPattern(pattern: string) {
    if (pattern.startsWith('./')) {
      return pattern.slice(2);
    }

    return pattern.startsWith('**/') ? pattern : join('**', pattern).replaceAll('\\', '/');
  }

  private matchesLiteralBasename(path: string, pattern: string) {
    const name = basename(pattern);
    return /[*{}]/.test(name) || basename(path) === name;
  }

  private imports() {
    const sourceFile = this.sourceFile();
    const imports: string[] = [];

    for (const statement of sourceFile.statements) {
      if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
        imports.push(statement.moduleSpecifier.text);
      }

      if (ts.isExportDeclaration(statement) && statement.moduleSpecifier !== undefined) {
        if (ts.isStringLiteral(statement.moduleSpecifier)) {
          imports.push(statement.moduleSpecifier.text);
        }
      }
    }

    return imports;
  }

  private sourceFile() {
    const sourceText = readFileSync(this.path, 'utf-8');
    const scriptKind = extname(this.path) === '.tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    return ts.createSourceFile(this.path, sourceText, ts.ScriptTarget.Latest, true, scriptKind);
  }

  private isAllowedImport(specifier: string, allowedImports: string[]) {
    return allowedImports.some((allowed) => specifier === allowed || specifier.startsWith(`${allowed}/`));
  }
}
