import type { GuardrailConfig } from '../types';

// Maps each parsed object back to the comment block immediately preceding it
// in the source file. Used to build stack-trace style recommendations.
const leadingCommentsByObject = new WeakMap<object, string[]>();

/**
 * Parses a code.guard file. The format is JSON but allows line and block
 * comments so authors can keep notes alongside their rules. Each comment
 * immediately preceding an object literal is recorded so callers can recover
 * it via {@link leadingCommentsOf}.
 */
export function parseGuardConfig(raw: string) {
  const comments = collectLeadingComments(raw);
  const config = JSON.parse(stripComments(raw)) as GuardrailConfig;
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

// Walks the raw text and records the trailing run of comments that sit between
// the most recent JSON token and each `{`. The result is indexed by the order
// objects appear in source, matching depth-first traversal of the parsed tree.
function collectLeadingComments(raw: string): string[][] {
  const result: string[][] = [];
  let pending: string[] = [];
  let inString = false;
  let escaped = false;

  for (let index = 0; index < raw.length; index++) {
    const char = raw[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
        pending = [];
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      pending = [];
      continue;
    }

    if (char === '/' && raw[index + 1] === '/') {
      let end = index + 2;
      while (end < raw.length && raw[end] !== '\n' && raw[end] !== '\r') {
        end += 1;
      }
      pending.push(raw.slice(index + 2, end).trim());
      index = end - 1;
      continue;
    }

    if (char === '/' && raw[index + 1] === '*') {
      let end = index + 2;
      while (end < raw.length - 1 && !(raw[end] === '*' && raw[end + 1] === '/')) {
        end += 1;
      }
      const body = raw.slice(index + 2, end);
      for (const line of body.split('\n')) {
        const trimmed = line.replace(/^\s*\*\s?/, '').trim();
        if (trimmed.length > 0) {
          pending.push(trimmed);
        }
      }
      index = end + 1;
      continue;
    }

    if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
      continue;
    }

    if (char === '{') {
      result.push(pending);
      pending = [];
      continue;
    }

    pending = [];
  }

  return result;
}

function stripComments(raw: string) {
  let stripped = '';
  let inString = false;
  let inLineComment = false;
  let inBlockComment = false;
  let escaped = false;

  for (let index = 0; index < raw.length; index++) {
    const char = raw[index] ?? '';
    const next = raw[index + 1];

    if (inLineComment) {
      if (char === '\n' || char === '\r') {
        inLineComment = false;
        stripped += char;
      } else {
        stripped += ' ';
      }
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        stripped += '  ';
        index += 1;
      } else {
        stripped += char === '\n' || char === '\r' ? char : ' ';
      }
      continue;
    }

    if (inString) {
      stripped += char;
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      stripped += char;
      continue;
    }

    if (char === '/' && next === '/') {
      inLineComment = true;
      stripped += '  ';
      index += 1;
      continue;
    }

    if (char === '/' && next === '*') {
      inBlockComment = true;
      stripped += '  ';
      index += 1;
      continue;
    }

    stripped += char;
  }

  return stripped;
}
