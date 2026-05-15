import { describe, expect, test } from 'bun:test';
import { markdownToTipTap, tipTapToMarkdown } from './document-content';

describe('document content markdown conversion', () => {
  test('converts headings and paragraphs to TipTap JSON', () => {
    const doc = markdownToTipTap('# Hello\n\nWorld');

    expect(doc).toEqual({
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Hello' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'World' }] },
      ],
    });
  });

  test('round-trips StarterKit block and inline nodes', () => {
    const markdown = [
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

    const doc = markdownToTipTap(markdown);
    const rendered = tipTapToMarkdown(doc);

    expect(doc.content?.some((node) => node.type === 'bulletList')).toBe(true);
    expect(doc.content?.some((node) => node.type === 'orderedList')).toBe(true);
    expect(doc.content?.some((node) => node.type === 'codeBlock')).toBe(true);
    expect(doc.content?.some((node) => node.type === 'horizontalRule')).toBe(true);
    expect(JSON.stringify(doc)).toContain('"type":"bold"');
    expect(JSON.stringify(doc)).toContain('"type":"italic"');
    expect(rendered).toContain('## Heading');
    expect(rendered).toContain('**Bold**');
    expect(rendered).toContain('`code`');
    expect(rendered).toContain('> Quote');
  });
});
