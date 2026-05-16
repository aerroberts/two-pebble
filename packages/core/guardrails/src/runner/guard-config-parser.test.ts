import { describe, expect, test } from 'bun:test';
import { parseGuardConfig } from './guard-config-parser';

describe('feature: guard config parser', () => {
  test('happy: parses line comments between guard fields', () => {
    const config = parseGuardConfig(`
      {
        // Package guards may explain local policy choices.
        "inherit": "@group/guardrails-typescript",
        "rules": []
      }
    `);

    expect(config.inherit).toBe('@group/guardrails-typescript');
  });

  test('happy: parses block comments between guard rules', () => {
    const config = parseGuardConfig(`
      {
        "rules": [
          /* Keep a note beside the rule it describes. */
          {
            "find": "src/**/*.ts",
            "rules": { "exists": true },
            "recommendation": "Files must exist."
          }
        ]
      }
    `);

    expect(config.rules).toHaveLength(1);
  });

  test('happy: preserves comment markers inside strings', () => {
    const config = parseGuardConfig(`
      {
        "rules": [
          {
            "find": "src/http.ts",
            "rules": { "contains": "https://example.com/*" },
            "recommendation": "Block markers like /* and */ stay in strings."
          }
        ]
      }
    `);

    expect(config.rules?.[0]?.rules?.contains).toBe('https://example.com/*');
  });
});
