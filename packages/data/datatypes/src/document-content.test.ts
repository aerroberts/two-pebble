import { describe, expect, test } from 'bun:test';
import { markdownToTipTap, tipTapToMarkdown } from './document-content';
import { expectStarterKitMarkdown, expectStarterKitNodes, STARTER_KIT_MARKDOWN } from './document-content.test-env';

describe('feature: document content markdown conversion', () => {
  test('happy: converts headings and paragraphs to TipTap JSON', () => {
    const doc = markdownToTipTap('# Hello\n\nWorld');

    expect(doc).toEqual({
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Hello' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'World' }] },
      ],
    });
  });

  test('happy: round-trips StarterKit block and inline nodes', () => {
    const doc = markdownToTipTap(STARTER_KIT_MARKDOWN);
    const rendered = tipTapToMarkdown(doc);

    expectStarterKitNodes(doc);
    expectStarterKitMarkdown(rendered);
  });
});
