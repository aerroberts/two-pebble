import { readFileSync } from 'node:fs';
import type { WorkspaceNode } from '@two-pebble/traversal';
import type { AssertOutcome, ContentAssert } from '../types';

/**
 * Asserts the raw text of every matched file contains every `includes` string
 * and none of the `lacks` strings. Only applies to file nodes; matching a
 * non-file node fails the assertion.
 */
export function validate(nodes: WorkspaceNode[], config: ContentAssert): AssertOutcome {
  if (nodes.length === 0) {
    return { passed: true };
  }
  for (const node of nodes) {
    if (node.type !== 'file') {
      return {
        passed: false,
        description: `content assertion only applies to file nodes, but a "${node.type}" node was matched.`,
      };
    }
    const path = node.getProperty('path');
    if (!path) {
      return { passed: false, description: 'Matched file node has no path metadata.' };
    }
    const text = readFileSync(path, 'utf-8');
    for (const needle of config.includes ?? []) {
      if (!text.includes(needle)) {
        return {
          passed: false,
          description: `Expected file to include ${JSON.stringify(needle)}, but it was not present.`,
        };
      }
    }
    for (const needle of config.lacks ?? []) {
      if (text.includes(needle)) {
        return { passed: false, description: `Expected file to lack ${JSON.stringify(needle)}, but it was present.` };
      }
    }
  }
  return { passed: true };
}
