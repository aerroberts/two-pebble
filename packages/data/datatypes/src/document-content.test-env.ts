import { expect } from 'bun:test';
import type { TipTapDocument } from './document-content';

/**
 * Markdown fixture covering the StarterKit nodes and marks supported by the
 * document conversion helpers. Tests use this single sample to verify both
 * markdown-to-TipTap and TipTap-to-markdown behavior.
 */
export const STARTER_KIT_MARKDOWN: string = [
  '## Heading',
  '',
  '- **Bold**',
  '- _Italic_ and `code`',
  '',
  '> Quote',
  '',
  '1. One',
  '2. Two',
  '',
  '```',
  'code block',
  '```',
  '',
  '---',
].join('\n');

/**
 * Asserts that a converted TipTap document retained the StarterKit node and
 * mark names expected by the editor. This keeps individual tests focused on
 * conversion behavior instead of repeated JSON inspection.
 */
export function expectStarterKitNodes(doc: TipTapDocument): void {
  expect(doc.content?.map((node) => node.type)).toEqual(
    expect.arrayContaining(['bulletList', 'orderedList', 'codeBlock', 'horizontalRule']),
  );
  expect(JSON.stringify(doc)).toContain('"type":"bold"');
  expect(JSON.stringify(doc)).toContain('"type":"italic"');
}

/**
 * Asserts that markdown serialization preserves the visible StarterKit
 * constructs used by the fixture. The checks intentionally focus on stable
 * markdown fragments rather than exact whitespace.
 */
export function expectStarterKitMarkdown(markdown: string): void {
  expect(markdown).toContain('## Heading');
  expect(markdown).toContain('**Bold**');
  expect(markdown).toContain('`code`');
  expect(markdown).toContain('> Quote');
}
