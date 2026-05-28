import { Extension, mergeAttributes, Node } from '@tiptap/core';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import {
  applyCommentAdd,
  applyCommentClose,
  COMMENT_CELL_NODE_TYPES,
  COMMENT_SECTION_NODE_TYPE,
  extractComments,
  normalizeDocumentComments,
  type TipTapDocument,
} from '@two-pebble/datatypes';

export interface AddCommentCommandInput {
  cellId: string;
  body: string;
  authorId: string;
}

export interface CloseCommentThreadCommandInput {
  cellId: string;
  closedReason: string;
  authorId: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    documentComments: {
      addComment: (input: AddCommentCommandInput) => ReturnType;
      closeCommentThread: (input: CloseCommentThreadCommandInput) => ReturnType;
    };
  }
}

export const CommentSectionNode = Node.create({
  name: COMMENT_SECTION_NODE_TYPE,
  group: 'block',
  atom: true,
  selectable: false,

  addAttributes() {
    return {
      threads: {
        default: [],
        parseHTML: () => [],
        renderHTML: () => ({ 'data-comment-threads': 'true' }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'section[data-comment-section]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'section',
      mergeAttributes(HTMLAttributes, {
        'data-comment-section': 'true',
        class: 'two-pebble-comment-section',
      }),
    ];
  },
});

export const CommentExtension = Extension.create({
  name: 'documentComments',

  addGlobalAttributes() {
    return [
      {
        types: [...COMMENT_CELL_NODE_TYPES],
        attributes: {
          cellId: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-cell-id'),
            renderHTML: (attributes) => {
              if (typeof attributes.cellId !== 'string' || attributes.cellId.length === 0) {
                return {};
              }
              return { 'data-cell-id': attributes.cellId };
            },
          },
        },
      },
    ];
  },

  onCreate() {
    normalizeEditorDocument(this.editor.view.state, (tr) => this.editor.view.dispatch(tr));
  },

  addCommands() {
    return {
      addComment:
        (input) =>
        ({ editor, commands }) => {
          const next = applyCommentAdd(editor.getJSON() as TipTapDocument, input);
          return commands.setContent(next);
        },
      closeCommentThread:
        (input) =>
        ({ editor, commands }) => {
          const next = applyCommentClose(editor.getJSON() as TipTapDocument, input);
          return commands.setContent(next);
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('document-comment-normalizer'),
        appendTransaction: (_transactions, _oldState, newState) => normalizeEditorDocument(newState),
      }),
      new Plugin({
        key: new PluginKey('document-comment-decorations'),
        props: {
          decorations: (state) => {
            const threadedCellIds = new Set<string>();
            for (const thread of extractComments(state.doc.toJSON() as TipTapDocument)) {
              threadedCellIds.add(thread.cellId);
            }
            if (threadedCellIds.size === 0) {
              return null;
            }
            const decorations: Decoration[] = [];
            state.doc.descendants((node, pos) => {
              const cellId = typeof node.attrs.cellId === 'string' ? node.attrs.cellId : '';
              if (!threadedCellIds.has(cellId)) {
                return true;
              }
              decorations.push(
                Decoration.node(pos, pos + node.nodeSize, {
                  class: 'has-comment-thread',
                }),
              );
              decorations.push(
                Decoration.widget(
                  pos + node.nodeSize - 1,
                  () => {
                    return createCommentThreadWidget();
                  },
                  { key: `comment-${cellId}`, side: 1 },
                ),
              );
              return true;
            });
            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});

function createCommentThreadWidget() {
  const element = document.createElement('span');
  element.className = 'comment-thread-widget';
  element.setAttribute('aria-label', 'Comments');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z');
  svg.append(path);
  element.append(svg);

  return element;
}

function normalizeEditorDocument(
  state: import('@tiptap/pm/state').EditorState,
  dispatch?: (tr: import('@tiptap/pm/state').Transaction) => void,
) {
  const current = state.doc.toJSON() as TipTapDocument;
  const normalized = normalizeDocumentComments(current);
  if (JSON.stringify(current) === JSON.stringify(normalized)) {
    return null;
  }
  const nextDoc = ProseMirrorNode.fromJSON(state.schema, normalized);
  const tr = state.tr.replaceWith(0, state.doc.content.size, nextDoc.content);
  tr.setMeta('addToHistory', false);
  if (dispatch !== undefined) {
    dispatch(tr);
    return null;
  }
  return tr;
}
