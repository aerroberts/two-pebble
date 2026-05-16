import { describe, expect, test } from 'bun:test';
import { leadingCommentsOf, parseGuardConfig } from './guard-config-parser';

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

  test('happy: parses inherit as an array of definitions', () => {
    const config = parseGuardConfig(`
      {
        "inherit": ["@group/guardrails-typescript", "@group/guardrails-tests"],
        "structure": []
      }
    `);

    expect(config.inherit).toEqual(['@group/guardrails-typescript', '@group/guardrails-tests']);
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

  test('happy: links leading comments to structure and code rule objects', () => {
    const config = parseGuardConfig(`
      {
        "structure": [
          // First include this string
          {
            "find": "src/**/index.ts",
            "recommendation": "included next",
            "code": [
              // Then also include this
              {
                "find": ["class", "interface"],
                "recommendation": "then include this",
                "asserts": { "exists": false }
              }
            ]
          }
        ]
      }
    `);

    const structureRule = config.structure?.[0];
    const codeRule = structureRule?.code?.[0];

    expect(leadingCommentsOf(structureRule)).toEqual(['First include this string']);
    expect(leadingCommentsOf(codeRule)).toEqual(['Then also include this']);
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
