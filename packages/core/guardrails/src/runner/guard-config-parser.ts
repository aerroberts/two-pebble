import type { GuardrailConfig } from '../types';

export function parseGuardConfig(raw: string) {
  return JSON.parse(stripComments(raw)) as GuardrailConfig;
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
