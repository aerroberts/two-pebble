import { describe, expect, test } from 'bun:test';
import { parseGuardConfig } from './guard-config-parser';

/**
 * Testing philosophy:
 * The parser must accept the JSON-with-comments format authors hand-write and
 * preserve content inside strings. The tests cover line comments, block
 * comments, and comment markers embedded inside strings.
 */

describe('feature: guard config parser', () => {
  test('happy: parses line comments between guard fields', () => {
    const config = parseGuardConfig(`
      {
        // Package guards may explain local policy choices.
        "inherit": "@group/guardrails-typescript",
        "structure": []
      }
    `);

    expect(config.inherit).toBe('@group/guardrails-typescript');
    expect(config.structure).toEqual([]);
  });

  test('happy: parses block comments between structure rules', () => {
    const config = parseGuardConfig(`
      {
        "structure": [
          /* Keep a note beside the rule it describes. */
          {
            "find": "src/asserts/exists.ts",
            "recommendation": "Must exist.",
            "asserts": { "exists": true }
          }
        ]
      }
    `);

    expect(config.structure).toHaveLength(1);
    expect(config.structure?.[0]?.find).toBe('src/asserts/exists.ts');
  });

  test('happy: preserves comment markers inside strings', () => {
    const config = parseGuardConfig(`
      {
        "structure": [
          {
            "find": "src/http.ts",
            "recommendation": "Block markers like /* and */ stay in strings.",
            "asserts": { "exists": true }
          }
        ]
      }
    `);

    expect(config.structure?.[0]?.recommendation).toBe('Block markers like /* and */ stay in strings.');
  });
});
