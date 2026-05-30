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

  test('happy: converts gfm pipe tables to TipTap table nodes', () => {
    const markdown = ['| Name | Status |', '| --- | --- |', '| Alpha | ok |', '| Beta | pending |'].join('\n');
    const doc = markdownToTipTap(markdown);
    expect(doc.content?.length).toBe(2);
    const table = doc.content?.[0];
    expect(table?.type).toBe('table');
    const rows = table?.content;
    expect(rows?.length).toBe(3);
    expect(rows?.[0].content?.map((cell) => cell.type)).toEqual(['tableHeader', 'tableHeader']);
    expect(rows?.[1].content?.map((cell) => cell.type)).toEqual(['tableCell', 'tableCell']);
    const firstHeaderText = rows?.[0].content?.[0].content?.[0].content?.[0].text;
    expect(firstHeaderText).toBe('Name');
    const firstBodyText = rows?.[1].content?.[0].content?.[0].content?.[0].text;
    expect(firstBodyText).toBe('Alpha');
  });

  test('happy: keeps surrounding markdown around a table block', () => {
    const markdown = ['Before', '', '| A | B |', '| - | - |', '| 1 | 2 |', '', 'After'].join('\n');
    const doc = markdownToTipTap(markdown);
    const types = doc.content?.map((node) => node.type);
    expect(types).toEqual(['paragraph', 'table', 'paragraph', 'commentSection']);
  });

  test('happy: preserves fenced code block languages', () => {
    const markdown = [
      '```mermaid',
      'flowchart LR',
      '  A --> B',
      '```',
      '',
      '```tsx',
      'export const A = <B />;',
      '```',
    ].join('\n');
    const doc = markdownToTipTap(markdown);
    const codeBlocks = doc.content?.filter((node) => node.type === 'codeBlock') ?? [];

    expect(codeBlocks.map((node) => node.attrs?.language)).toEqual(['mermaid', 'tsx']);
    expect(tipTapToMarkdown(doc)).toContain('```mermaid');
    expect(tipTapToMarkdown(doc)).toContain('```tsx');
  });

  test('happy: renders reference mention nodes to markdown text', () => {
    const doc: TipTapDocument = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { cellId: 'cell-mentions' },
          content: [
            { type: 'text', text: 'Use ' },
            { type: 'documentMention', attrs: { documentId: 'documents:1', name: 'Spec' } },
            { type: 'text', text: ' with ' },
            { type: 'memoryMention', attrs: { memoryId: 'memories:1', name: 'Runbook' } },
            { type: 'text', text: ' and ' },
            { type: 'skillMention', attrs: { skillId: 'skills:1', name: 'Log Reader' } },
            { type: 'text', text: '.' },
          ],
        },
      ],
    };

    expect(tipTapToMarkdown(doc)).toContain('Use @Spec with @Runbook and \\*Log Reader.');
  });
});
