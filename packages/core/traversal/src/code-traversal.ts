import { readFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import { WorkspaceFileParser } from './ast/code-ast';
import { traverse } from './ast/traverse';
import { WorkspaceNode } from './ast/workspace-node';
import { TraversalResultSet } from './result-set';

// Module-level cache so repeated `fileContent` reads across nodes for the
// same path are deduped within a process. Guardrail runs touch each file at
// most a few times; cache size is bounded by what the run sees.
const contentCache = new Map<string, string>();

function readContentCached(filePath: string): string {
  const hit = contentCache.get(filePath);
  if (hit !== undefined) {
    return hit;
  }
  const text = readFileSync(filePath, 'utf-8');
  contentCache.set(filePath, text);
  return text;
}

/**
 * Exposes a way to run a "find" scoped operation against a codebase.
 * Queries use a file glob followed by `#` and then an AST path expression.
 */
export class CodeTraversal {
  // Where this traversal is rooted in the file tree
  public readonly rootPath: string;
  private readonly fileParser: WorkspaceFileParser;

  /**
   * Creates a traversal rooted at an absolute file or folder path.
   */
  public constructor(root: string) {
    this.rootPath = root;
    this.fileParser = new WorkspaceFileParser();
  }

  /**
   * Runs the given query (or queries) against the codebase and returns a resultant set of nodes.
   * Accepts a single query string or an array of strings whose results are merged.
   */
  public async find(query: string | string[]) {
    const queries = Array.isArray(query) ? query : [query];
    const results = new TraversalResultSet();
    for (const single of queries) {
      results.merge(await this.runQuery(single));
    }
    return results;
  }

  private async runQuery(query: string) {
    const [fileQuery, astQuery] = query.split('#');

    // First get all the matching files using glob matching pattern
    // This results in a set of files which we can then do a further AST query against if required
    const globResult = await this.filesForGlob(fileQuery);

    // If we dont have an ast query, we can just return the files ResultSet
    if (!astQuery) {
      return globResult.resultSet;
    }

    // If we do have an ast query, we need to run it on each node.
    const fileAstResults = new TraversalResultSet();
    for (const filePath of globResult.fileNames) {
      const fileAstResult = await this.resolveQueryInFile(filePath, astQuery);
      fileAstResults.merge(fileAstResult);
    }
    return fileAstResults;
  }

  private async filesForGlob(globPattern: string) {
    const files = await glob(globPattern);
    const resultSet = new TraversalResultSet();
    const fileNames: string[] = [];
    for await (const filePath of files) {
      const filename = basename(filePath);
      const node = new WorkspaceNode('file')
        .withData({
          path: filePath,
          filename,
          name: basename(filename, extname(filename)),
        })
        // Files are commonly listed without ever inspecting their bytes
        // (e.g., a plain `exists` check). Defer the read until something
        // actually asks for content.
        .withLazyData({
          fileContent: () => readContentCached(filePath),
        });
      resultSet.add(node);
      fileNames.push(filePath);
    }
    return { resultSet, fileNames };
  }

  private async resolveQueryInFile(filePath: string, query: string) {
    const fileAst = await this.fileParser.readAst(filePath);
    return traverse(query, fileAst);
  }
}
