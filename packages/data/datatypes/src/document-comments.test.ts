import { describe, expect, test } from 'bun:test';
import {
  applyCommentAdd,
  applyCommentClose,
  extractComments,
  normalizeDocumentComments,
  validateDocumentComments,
} from './document-comments';
import type { TipTapDocument } from './document-content';

describe('feature: document comments', () => {
  test('happy: normalizes cell ids and a trailing comment section', () => {
    const doc = normalizeDocumentComments({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'First' }] },
        { type: 'paragraph', attrs: { cellId: 'same' }, content: [{ type: 'text', text: 'Second' }] },
        { type: 'paragraph', attrs: { cellId: 'same' }, content: [{ type: 'text', text: 'Third' }] },
      ],
    });

    expect(doc.content?.at(-1)?.type).toBe('commentSection');
    const ids = (doc.content ?? []).filter((node) => node.type === 'paragraph').map((node) => node.attrs?.cellId);
    expect(new Set(ids).size).toBe(3);
    validateDocumentComments(doc);
  });

  test('happy: add reopens a closed thread and appends a comment', () => {
    const doc = sampleCommentDoc();
    const closed = applyCommentClose(doc, {
      authorId: 'agent-1',
      cellId: 'cell-1',
      closedReason: 'fixed',
      now: 2,
    });
    const reopened = applyCommentAdd(closed, {
      authorId: 'human',
      body: 'still wrong',
      cellId: 'cell-1',
      commentId: 'comment-2',
      now: 3,
    });

    expect(extractComments(reopened)).toEqual([
      {
        cellId: 'cell-1',
        status: 'open',
        comments: [
          { id: 'comment-1', authorId: 'human', body: 'looks off', createdAt: 1 },
          { id: 'comment-2', authorId: 'human', body: 'still wrong', createdAt: 3 },
        ],
      },
    ]);
  });

  test('sad: close rejects an empty reason', () => {
    expect(() =>
      applyCommentClose(sampleCommentDoc(), {
        authorId: 'agent-1',
        cellId: 'cell-1',
        closedReason: ' ',
      }),
    ).toThrow(/reason/);
  });

  test('sad: validator rejects malformed comment invariants', () => {
    expect(() => validateDocumentComments({ type: 'doc', content: [{ type: 'paragraph' }] })).toThrow(/cellId/);
    expect(() =>
      validateDocumentComments({
        type: 'doc',
        content: [
          { type: 'commentSection', attrs: { threads: [] } },
          { type: 'paragraph', attrs: { cellId: 'cell-1' } },
        ],
      }),
    ).toThrow(/last/);
    expect(() =>
      validateDocumentComments({
        type: 'doc',
        content: [
          { type: 'paragraph', attrs: { cellId: 'cell-1' } },
          {
            type: 'commentSection',
            attrs: {
              threads: [{ cellId: 'cell-1', status: 'closed', comments: [] }],
            },
          },
        ],
      }),
    ).toThrow(/closedReason/);
  });
});

function sampleCommentDoc(): TipTapDocument {
  return {
    type: 'doc',
    content: [
      { type: 'paragraph', attrs: { cellId: 'cell-1' }, content: [{ type: 'text', text: 'First' }] },
      {
        type: 'commentSection',
        attrs: {
          threads: [
            {
              cellId: 'cell-1',
              status: 'open',
              comments: [{ id: 'comment-1', authorId: 'human', body: 'looks off', createdAt: 1 }],
            },
          ],
        },
      },
    ],
  };
}
