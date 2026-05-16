import type { WorkspaceNode } from '@two-pebble/traversal';
import type { AssertConfig } from '../types';

export interface AssertOutcome {
  passed: boolean;
  description?: string;
}

export type AssertName = keyof AssertConfig;

export type AssertionFn = (nodes: WorkspaceNode[], config: never) => AssertOutcome;
