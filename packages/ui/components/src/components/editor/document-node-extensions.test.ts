import { describe, expect, it } from 'bun:test';
import { getSchema } from '@tiptap/core';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import StarterKit from '@tiptap/starter-kit';
import { createDocumentNodeExtensions } from './document-node-extensions';

describe('document node extensions', () => {
  it('accepts cli-created document tables and trailing comment sections', () => {
    const schema = getSchema([StarterKit, ...createDocumentNodeExtensions()]);
    const doc = ProseMirrorNode.fromJSON(schema, {
      type: 'doc',
      content: [
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableHeader',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Name' }] }],
                },
                {
                  type: 'tableHeader',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Value' }] }],
                },
              ],
            },
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Alpha' }] }],
                },
                {
                  type: 'tableCell',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: '1' }] }],
                },
              ],
            },
          ],
        },
        { type: 'commentSection', attrs: { threads: [] } },
      ],
    });

    expect(doc.toJSON()).toEqual({
      type: 'doc',
      content: [
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableHeader',
                  attrs: { colspan: 1, rowspan: 1, colwidth: null },
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Name' }] }],
                },
                {
                  type: 'tableHeader',
                  attrs: { colspan: 1, rowspan: 1, colwidth: null },
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Value' }] }],
                },
              ],
            },
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  attrs: { colspan: 1, rowspan: 1, colwidth: null },
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Alpha' }] }],
                },
                {
                  type: 'tableCell',
                  attrs: { colspan: 1, rowspan: 1, colwidth: null },
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: '1' }] }],
                },
              ],
            },
          ],
        },
        { type: 'commentSection', attrs: { threads: [] } },
      ],
    });
  });
});
