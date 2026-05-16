import type { WorkspaceNode } from '@two-pebble/traversal';
import type { AssertOutcome, StartsWithAssert } from '../types';

/**
 * Asserts every matched node has a string property that starts with one of the
 * configured prefixes. By default this validates the node's `name` metadata.
 */
export function validate(nodes: WorkspaceNode[], config: StartsWithAssert): AssertOutcome {
  if (nodes.length === 0) {
    return { passed: true };
  }
  const property = config.property ?? 'name';
  const prefixes = Array.isArray(config.values) ? config.values : [config.values];
  for (const node of nodes) {
    const actual = node.getProperty(property);
    if (!actual || !prefixes.some((prefix) => actual.startsWith(prefix))) {
      return {
        passed: false,
        description: `Expected ${property} to start with ${formatPrefixes(prefixes)}, but found "${actual ?? '<missing>'}".`,
      };
    }
  }
  return { passed: true };
}

function formatPrefixes(prefixes: string[]) {
  return prefixes.map((prefix) => JSON.stringify(prefix)).join(' or ');
}
