import { describe, expect, test } from 'bun:test';
import type { TipTapDocument } from './document-content';
import { markdownToTipTap, tipTapToMarkdown } from './document-content';
import { expectStarterKitMarkdown, expectStarterKitNodes, STARTER_KIT_MARKDOWN } from './document-content.test-env';

describe('feature: document content markdown conversion', () => {
  test('happy: converts headings and paragraphs to TipTap JSON', () => {
    const doc = markdownToTipTap('# Hello\n\nWorld');

    expect(doc.type).toBe('doc');
    expect(doc.content?.[0]).toMatchObject({
      type: 'heading',
      attrs: { level: 1, cellId: expect.any(String) },
      content: [{ type: 'text', text: 'Hello' }],
    });
    expect(doc.content?.[1]).toMatchObject({
      type: 'paragraph',
      attrs: { cellId: expect.any(String) },
      content: [{ type: 'text', text: 'World' }],
    });
    expect(doc.content?.[2]).toEqual({ type: 'commentSection', attrs: { threads: [] } });
  });

  test('happy: round-trips StarterKit block and inline nodes', () => {
    const doc = markdownToTipTap(STARTER_KIT_MARKDOWN);
    const rendered = tipTapToMarkdown(doc);

    expectStarterKitNodes(doc);
    expectStarterKitMarkdown(rendered);
  });

  test('happy: appends comment threads to markdown output', () => {
    const doc: TipTapDocument = {
      type: 'doc',
      content: [
        { type: 'paragraph', attrs: { cellId: 'cell-1' }, content: [{ type: 'text', text: 'Original cell' }] },
        {
          type: 'commentSection',
          attrs: {
            threads: [
              {
                cellId: 'cell-1',
                status: 'closed',
                closedReason: 'fixed',
                comments: [{ id: 'comment-1', authorId: 'human', body: 'looks off', createdAt: 1 }],
              },
              {
                cellId: 'missing-cell',
                status: 'open',
                comments: [{ id: 'comment-2', authorId: 'agent', body: 'orphaned', createdAt: 2 }],
              },
            ],
          },
        },
      ],
    };

    const rendered = tipTapToMarkdown(doc);

    expect(rendered).toContain('Original cell');
    expect(rendered).toContain('## Comments');
    expect(rendered).toContain('> Original cell');
    expect(rendered).toContain('- human (closed: fixed): looks off');
    expect(rendered).toContain('### Orphaned');
    expect(rendered).toContain('> (deleted)');
  });
});
