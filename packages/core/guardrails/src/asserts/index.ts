import type { WorkspaceNode } from '@two-pebble/traversal';
import type { AssertConfig } from '../types';
import { existsAssertion } from './exists';
import type { AssertName, AssertOutcome } from './types';

export type { AssertOutcome } from './types';

/**
 * Maps each supported assertion name to its implementation. To add a new
 * assertion, drop a file in this folder and register it here.
 */
const REGISTRY: {
  [Name in AssertName]: (nodes: WorkspaceNode[], config: NonNullable<AssertConfig[Name]>) => AssertOutcome;
} = {
  exists: existsAssertion,
};

/**
 * Runs every assertion declared on a structure rule against its find result.
 */
export function runAsserts(
  nodes: WorkspaceNode[],
  asserts: AssertConfig,
): { name: AssertName; outcome: AssertOutcome }[] {
  const outcomes: { name: AssertName; outcome: AssertOutcome }[] = [];
  for (const name of Object.keys(asserts) as AssertName[]) {
    const config = asserts[name];
    if (config === undefined) {
      continue;
    }
    const assertion = REGISTRY[name] as (nodes: WorkspaceNode[], config: unknown) => AssertOutcome;
    outcomes.push({ name, outcome: assertion(nodes, config) });
  }
  return outcomes;
}
