import { randomUUID } from 'node:crypto';
import type { CustomAstTokenEnums } from '../types';

/**
 * Represents one node in the traversal package's simplified workspace AST.
 * The node owns child relationships, source ranges, and string metadata used
 * by query matching without exposing the TypeScript compiler AST directly.
 */
export class WorkspaceNode {
  public readonly id: string = randomUUID();

  public readonly type: CustomAstTokenEnums;

  // Nodes own children
  public readonly children: WorkspaceNode[];

  // 1-indexed line range covered by the underlying source. Optional because some
  // workspace-level nodes (folders) are not backed by a single source range.
  public startLine?: number;
  public endLine?: number;

  // Nodes can store additional arbitrary data
  private data: Record<string, string>;

  public constructor(type: CustomAstTokenEnums) {
    this.type = type;
    this.children = [];
    this.data = {};
  }

  public withData(data: Record<string, string>) {
    this.data = { ...this.data, ...data };
    return this;
  }

  public withRange(startLine: number, endLine: number) {
    this.startLine = startLine;
    this.endLine = endLine;
    return this;
  }

  public addChild(child: WorkspaceNode) {
    this.children.push(child);
    return this;
  }

  public getProperty(name: string) {
    return this.data[name];
  }

  // Number of source lines this node spans, inclusive on both ends.
  public get lines() {
    if (this.startLine === undefined || this.endLine === undefined) {
      return undefined;
    }
    return this.endLine - this.startLine + 1;
  }
}
