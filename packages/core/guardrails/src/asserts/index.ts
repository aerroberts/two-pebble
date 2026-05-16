import type { WorkspaceNode } from '@two-pebble/traversal';
import type { AssertConfig, AssertName, AssertOutcome } from '../types';
import { existsAssertion } from './exists';
import { linesAssertion } from './lines';
import { matchesAssertion } from './matches';
import { typeAssertion } from './type';

type AssertionImpl<Name extends AssertName> = (
  nodes: WorkspaceNode[],
  config: NonNullable<AssertConfig[Name]>,
) => AssertOutcome;

type Registry = {
  [Name in AssertName]: AssertionImpl<Name>;
};

/**
 * Maps each supported assertion name to its implementation. To add a new
 * assertion, drop a file in this folder and register it here.
 */
const REGISTRY: Registry = {
  exists: existsAssertion,
  type: typeAssertion,
  matches: matchesAssertion,
  lines: linesAssertion,
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
