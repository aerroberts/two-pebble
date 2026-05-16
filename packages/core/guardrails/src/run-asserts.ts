import type { WorkspaceNode } from '@two-pebble/traversal';
import { validate as existsValidate } from './asserts/exists';
import { validate as linesValidate } from './asserts/lines';
import { validate as matchesValidate } from './asserts/matches';
import { validate as namedValidate } from './asserts/named';
import { validate as typeValidate } from './asserts/type';
import type { AssertConfig, AssertName, AssertOutcome } from './types';

type AssertionImpl<Name extends AssertName> = (
  nodes: WorkspaceNode[],
  config: NonNullable<AssertConfig[Name]>,
) => AssertOutcome;

type Registry = {
  [Name in AssertName]: AssertionImpl<Name>;
};

/**
 * Maps each supported assertion name to its implementation. To add a new
 * assertion, drop a file in `src/asserts` that exports `validate` and register
 * it here.
 */
const REGISTRY: Registry = {
  exists: existsValidate,
  type: typeValidate,
  named: namedValidate,
  matches: matchesValidate,
  lines: linesValidate,
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
