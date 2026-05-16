import { describe, expect, test } from 'bun:test';
import type { Editor } from '@tiptap/core';
import { readActiveSlashTrigger } from './slash-trigger';

interface MockEditorOptions {
  text: string;
  head: number;
}

/**
 * Builds the smallest viable `Editor`-shaped stub for exercising the
 * pure `readActiveSlashTrigger` reader. Only the fields actually touched
 * by the reader are populated; everything else stays absent so a
 * misuse would surface as a TypeScript signal in CI rather than a
 * runtime failure under test.
 */
function mockEditor(options: MockEditorOptions): Editor {
  return {
    state: {
      selection: { head: options.head },
      doc: {
        textBetween: (_from: number, _to: number, _block: string, _leaf: string) =>
          options.text.slice(0, options.head),
      },
    },
    view: {
      coordsAtPos: () => ({ left: 0, bottom: 0, right: 0, top: 0 }),
    },
  } as unknown as Editor;
}

describe('feature: slash trigger reader', () => {
  test('happy: extracts command and empty query for /task', () => {
    const trigger = readActiveSlashTrigger(mockEditor({ text: '/task', head: 5 }));
    expect(trigger?.command).toBe('task');
    expect(trigger?.query).toBe('');
  });

  test('happy: extracts command and trailing arguments for /task with text', () => {
    const text = '/task buy milk';
    const trigger = readActiveSlashTrigger(mockEditor({ text, head: text.length }));
    expect(trigger?.command).toBe('task');
    expect(trigger?.query).toBe('buy milk');
  });

  test('happy: returns null when cursor is not on a slash', () => {
    const trigger = readActiveSlashTrigger(mockEditor({ text: 'hello world', head: 5 }));
    expect(trigger).toBeNull();
  });

  test('happy: recognizes /doc as a separate command', () => {
    const text = '/doc plan';
    const trigger = readActiveSlashTrigger(mockEditor({ text, head: text.length }));
    expect(trigger?.command).toBe('doc');
    expect(trigger?.query).toBe('plan');
  });

  test('happy: lowercases the command', () => {
    const trigger = readActiveSlashTrigger(mockEditor({ text: '/TASK', head: 5 }));
    expect(trigger?.command).toBe('task');
  });
});
