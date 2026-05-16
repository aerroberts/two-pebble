import { randomUUID } from 'node:crypto';
import type { CustomAstTokenEnums } from '../types';

export class WorkspaceNode {
  public readonly id: string = randomUUID();

  public readonly type: CustomAstTokenEnums;

  // Nodes own children
  public readonly children: WorkspaceNode[];

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

  public addChild(child: WorkspaceNode) {
    this.children.push(child);
    return this;
  }

  public getProperty(name: string) {
    return this.data[name];
  }
}
