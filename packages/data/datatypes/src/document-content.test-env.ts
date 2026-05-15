import { expect } from 'bun:test';
import type { TipTapDocument } from './document-content';

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

export function expectStarterKitNodes(doc: TipTapDocument): void {
  expect(doc.content?.map((node) => node.type)).toEqual(
    expect.arrayContaining(['bulletList', 'orderedList', 'codeBlock', 'horizontalRule']),
  );
  expect(JSON.stringify(doc)).toContain('"type":"bold"');
  expect(JSON.stringify(doc)).toContain('"type":"italic"');
}

export function expectStarterKitMarkdown(markdown: string): void {
  expect(markdown).toContain('## Heading');
  expect(markdown).toContain('**Bold**');
  expect(markdown).toContain('`code`');
  expect(markdown).toContain('> Quote');
}
