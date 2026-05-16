import { glob } from 'node:fs/promises';
import { WorkspaceFileParser } from './ast/code-ast';
import { traverse } from './ast/traverse';
import { WorkspaceNode } from './ast/workspace-node';
import { TraversalResultSet } from './result-set';

/**
 * Exposes a way to run a "find" scoped operation against a codebase
 * This is expressed in the format of a file glob followed by # and then an ast query
 *
 **/

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
      resultSet.add(
        new WorkspaceNode('file').withData({
          path: filePath,
        }),
      );
      fileNames.push(filePath);
    }
    return { resultSet, fileNames };
  }

  private async resolveQueryInFile(filePath: string, query: string) {
    const fileAst = await this.fileParser.readAst(filePath);
    return traverse(query, fileAst);
  }
}
