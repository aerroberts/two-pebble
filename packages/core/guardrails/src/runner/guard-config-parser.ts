import { type ParseError, parse, printParseErrorCode, visit } from 'jsonc-parser';
import { InvalidGuardrailConfigError } from '../errors';
import type { GuardrailConfig } from '../types';

// Maps each parsed object back to the comment block immediately preceding it
// in the source file. Used to build stack-trace style guidance.
const leadingCommentsByObject = new WeakMap<object, string[]>();

const PARSE_OPTIONS = { allowTrailingComma: true, disallowComments: false } as const;

/**
 * Parses a code.guard file. The format is JSONC (JSON with comments and
 * trailing commas) so authors can keep notes alongside their rules. Each
 * comment block immediately preceding an object literal is recorded so
 * callers can recover it via {@link leadingCommentsOf}.
 */
export function parseGuardConfig(raw: string): GuardrailConfig {
  const errors: ParseError[] = [];
  const config = parse(raw, errors, PARSE_OPTIONS) as GuardrailConfig;
  if (errors.length > 0) {
    const first = errors[0];
    if (first) {
      throw new InvalidGuardrailConfigError(`${printParseErrorCode(first.error)} at offset ${first.offset}.`);
    }
  }
  const comments = collectLeadingComments(raw);
  attachLeadingComments(config, comments, { current: 0 });
  return config;
}

/**
 * Returns the comment lines that immediately preceded the given object in the
 * original guard file, or an empty array if none were recorded.
 */
export function leadingCommentsOf(value: object | undefined): string[] {
  if (!value) {
    return [];
  }
  return leadingCommentsByObject.get(value) ?? [];
}

function attachLeadingComments(value: unknown, comments: string[][], counter: { current: number }) {
  if (Array.isArray(value)) {
    for (const item of value) {
      attachLeadingComments(item, comments, counter);
    }
    return;
  }
  if (value === null || typeof value !== 'object') {
    return;
  }
  const leading = comments[counter.current] ?? [];
  counter.current += 1;
  if (leading.length > 0) {
    leadingCommentsByObject.set(value, leading);
  }
  for (const key of Object.keys(value)) {
    attachLeadingComments((value as Record<string, unknown>)[key], comments, counter);
  }
}

// Walks the source with jsonc-parser's visitor and records the comment lines
// that sit immediately before each `{`. The resulting array is indexed by
// object encounter order, matching the depth-first traversal of the parsed
// tree so attachLeadingComments can pair them up.
function collectLeadingComments(raw: string): string[][] {
  const result: string[][] = [];
  let pending: string[] = [];

  visit(
    raw,
    {
      onObjectBegin: () => {
        result.push(pending);
        pending = [];
      },
      onObjectEnd: () => {
        pending = [];
      },
      onArrayBegin: () => {
        pending = [];
      },
      onArrayEnd: () => {
        pending = [];
      },
      onLiteralValue: () => {
        pending = [];
      },
      onSeparator: () => {
        pending = [];
      },
      onObjectProperty: () => {
        pending = [];
      },
      onComment: (offset, length) => {
        pending.push(...extractCommentLines(raw.slice(offset, offset + length)));
      },
    },
    PARSE_OPTIONS,
  );

  return result;
}

function extractCommentLines(raw: string): string[] {
  if (raw.startsWith('//')) {
    return [raw.slice(2).trim()];
  }
  if (raw.startsWith('/*')) {
    const body = raw.slice(2, raw.endsWith('*/') ? -2 : undefined);
    const lines: string[] = [];
    for (const line of body.split('\n')) {
      const trimmed = line.replace(/^\s*\*\s?/, '').trim();
      if (trimmed.length > 0) {
        lines.push(trimmed);
      }
    }
    return lines;
  }
  return [];
}
