import type { TipTapDocument } from './document-content';

/**
 * Builds a representative TipTap document for todo extraction tests.
 * The fixture includes open, completed, invalid, and nested todo nodes so
 * callers can exercise traversal without repeating verbose document JSON.
 */
export function sampleDoc(): TipTapDocument {
  return {
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'intro' }] },
      {
        type: 'todoItem',
        attrs: { id: '01J-A', status: 'open' },
        content: [{ type: 'text', text: 'first task' }],
      },
      {
        type: 'todoItem',
        attrs: { id: '01J-B', status: 'completed', completionType: 'manual' },
        content: [{ type: 'text', text: 'done thing' }],
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'todoItem',
                attrs: { id: '01J-C', status: 'invalid' },
                content: [{ type: 'text', text: 'nested todo' }],
              },
            ],
          },
        ],
      },
    ],
  };
}
