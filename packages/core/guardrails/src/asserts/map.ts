import type { WorkspaceNode } from '@two-pebble/traversal';
import type { AssertContext } from '../assert-context';
import type { AssertOutcome, MapAssert } from '../types';

/**
 * Pairs every `fromRef` value with every `toRef` value, then turns the
 * pairing into a coverage claim. Both sides are named refs declared on
 * earlier (or the same) rules; the assert itself does not look at the
 * current find's nodes — they only matter if this rule also declares
 * one of the refs.
 *
 *   - fullyConsumes: every fromRef value participates in at least one pair
 *   - fullyCovers:   every toRef value participates in at least one pair
 *
 * `method` chooses how a (from, to) pair counts as matched:
 *   - "equals":    from === to
 *   - "substring": to.includes(from)
 */
export function validate(_nodes: WorkspaceNode[], config: MapAssert, ctx?: AssertContext): AssertOutcome {
  if (!ctx) {
    return {
      passed: false,
      description: 'map assertion requires a ref registry — make sure the runner threads context into runAsserts.',
    };
  }
  const fromValues = ctx.refs.get(config.fromRef);
  if (!fromValues) {
    return {
      passed: false,
      description: `map.fromRef "${config.fromRef}" was not declared by any rule.`,
    };
  }
  const toValues = ctx.refs.get(config.toRef);
  if (!toValues) {
    return {
      passed: false,
      description: `map.toRef "${config.toRef}" was not declared by any rule.`,
    };
  }

  const method = config.method ?? 'equals';
  const matchedFroms = new Set<string>();
  const matchedTos = new Set<string>();
  for (const from of fromValues) {
    for (const to of toValues) {
      if (pairs(from, to, method)) {
        matchedFroms.add(from);
        matchedTos.add(to);
      }
    }
  }

  if (config.fullyConsumes) {
    const missing = unique(fromValues).filter((value) => !matchedFroms.has(value));
    if (missing.length > 0) {
      return {
        passed: false,
        description: `Expected every "${config.fromRef}" value to map into a "${config.toRef}" match, but ${missing.length} did not: ${formatList(missing)}.`,
      };
    }
  }

  if (config.fullyCovers) {
    const orphans = unique(toValues).filter((value) => !matchedTos.has(value));
    if (orphans.length > 0) {
      return {
        passed: false,
        description: `Expected every "${config.toRef}" value to map from a "${config.fromRef}" value, but ${orphans.length} did not: ${formatList(orphans)}.`,
      };
    }
  }

  return { passed: true };
}

function pairs(from: string, to: string, method: 'equals' | 'substring') {
  if (method === 'substring') {
    return to.includes(from);
  }
  return from === to;
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function formatList(values: string[]) {
  const limit = 5;
  const shown = values.slice(0, limit).map((value) => JSON.stringify(value));
  if (values.length > limit) {
    shown.push(`…and ${values.length - limit} more`);
  }
  return shown.join(', ');
}
