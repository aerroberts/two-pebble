import type { JSONContent } from '@tiptap/core';

export const PLAIN_PARAGRAPH_DOC: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hello world' }] }],
};

export const MENTION_DOC: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'see ' },
        { type: 'documentMention', attrs: { documentId: 'doc-1', name: 'plan' } },
        { type: 'text', text: ' before responding' },
      ],
    },
  ],
};

export const CODE_BLOCK_DOC: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'codeBlock',
      attrs: { language: 'typescript' },
      content: [{ type: 'text', text: 'const x = 1;' }],
    },
  ],
};

export const EMPTY_PARAGRAPH_DOC: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

export const MISSING_ID_MENTION_DOC: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'documentMention', attrs: { documentId: '', name: 'ghost' } }],
    },
  ],
};
