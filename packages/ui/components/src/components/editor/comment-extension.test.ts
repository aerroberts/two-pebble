import { describe, expect, it } from 'bun:test';
import { getSchema } from '@tiptap/core';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { EditorState, TextSelection } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import { CommentExtension, normalizeEditorDocument } from './comment-extension';
import { createDocumentNodeExtensions } from './document-node-extensions';
import { TodoItemNode } from './todo-item-node';

const schema = getSchema([StarterKit, ...createDocumentNodeExtensions(), TodoItemNode, CommentExtension]);

function stateFrom(doc: unknown, cursor: number): EditorState {
  const node = ProseMirrorNode.fromJSON(schema, doc);
  return EditorState.create({ schema, doc: node, selection: TextSelection.create(node, cursor) });
}

function cellIds(state: EditorState): string[] {
  const ids: string[] = [];
  state.doc.descendants((node) => {
    if (node.type.name === 'paragraph' && typeof node.attrs.cellId === 'string') {
      ids.push(node.attrs.cellId);
    }
    return true;
  });
  return ids;
}

describe('normalizeEditorDocument', () => {
  it('assigns missing cellIds without moving the selection', () => {
    // A fresh paragraph (e.g. just created with Enter) has no cellId. The old
    // normalizer rebuilt the whole document and jumped the cursor to the end;
    // this asserts the cursor stays put.
    const cursor = 3;
    const state = stateFrom(
      {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { cellId: 'CELL00000000000000000000001' },
            content: [{ type: 'text', text: 'Hello world' }],
          },
          { type: 'paragraph', content: [{ type: 'text', text: 'Second' }] },
        ],
      },
      cursor,
    );

    const tr = normalizeEditorDocument(state);
    expect(tr).not.toBeNull();
    const next = state.apply(tr as NonNullable<typeof tr>);

    // Cursor preserved exactly.
    expect(next.selection.from).toBe(cursor);
    // Both paragraphs now have non-empty, unique cellIds.
    const ids = cellIds(next);
    expect(ids).toHaveLength(2);
    expect(ids.every((id) => id.length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(2);
    // A single trailing comment section is present.
    expect(next.doc.lastChild?.type.name).toBe('commentSection');
  });

  it('is a no-op on an already-normalized document', () => {
    const state = stateFrom(
      {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { cellId: 'CELL00000000000000000000001' },
            content: [{ type: 'text', text: 'Hello' }],
          },
          { type: 'commentSection', attrs: { threads: [] } },
        ],
      },
      2,
    );
    expect(normalizeEditorDocument(state)).toBeNull();
  });

  it('deduplicates a duplicated cellId (e.g. from a paste) and keeps the cursor', () => {
    const cursor = 2;
    const state = stateFrom(
      {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { cellId: 'DUP0000000000000000000000001' },
            content: [{ type: 'text', text: 'A' }],
          },
          {
            type: 'paragraph',
            attrs: { cellId: 'DUP0000000000000000000000001' },
            content: [{ type: 'text', text: 'B' }],
          },
          { type: 'commentSection', attrs: { threads: [] } },
        ],
      },
      cursor,
    );

    const tr = normalizeEditorDocument(state);
    expect(tr).not.toBeNull();
    const next = state.apply(tr as NonNullable<typeof tr>);
    expect(next.selection.from).toBe(cursor);
    expect(new Set(cellIds(next)).size).toBe(2);
  });

  it('deduplicates a duplicated todo id so toggling one does not flip the other', () => {
    const state = stateFrom(
      {
        type: 'doc',
        content: [
          { type: 'todoItem', attrs: { id: 'DUP', status: 'open' }, content: [{ type: 'text', text: 'A' }] },
          { type: 'todoItem', attrs: { id: 'DUP', status: 'open' }, content: [{ type: 'text', text: 'B' }] },
          { type: 'commentSection', attrs: { threads: [] } },
        ],
      },
      2,
    );
    const tr = normalizeEditorDocument(state);
    expect(tr).not.toBeNull();
    const next = state.apply(tr as NonNullable<typeof tr>);
    const todoIds: string[] = [];
    next.doc.descendants((node) => {
      if (node.type.name === 'todoItem' && typeof node.attrs.id === 'string') {
        todoIds.push(node.attrs.id);
      }
      return true;
    });
    expect(todoIds).toHaveLength(2);
    expect(new Set(todoIds).size).toBe(2);
  });
});
