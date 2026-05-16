import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { CodeAstBuilder } from './build-ast';
import type { WorkspaceNode } from './workspace-node';

/**
 * Caches parsed asts for file paths in a workspcae with the aim to speed up traversals
 */
export class WorkspaceFileParser {
  private readonly inMemoryCache: Record<string, WorkspaceNode>;

  public constructor() {
    this.inMemoryCache = {};
  }

  public async readAst(filePath: string) {
    if (this.inMemoryCache[filePath]) {
      return this.inMemoryCache[filePath];
    }

    const ast = await this.resolveAst(filePath);
    this.inMemoryCache[filePath] = ast;
    return ast;
  }

  private async resolveAst(filePath: string) {
    const text = await readFile(filePath, 'utf-8');
    const ast = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true);
    const builder = new CodeAstBuilder(ast);
    return builder.build();
  }
}
