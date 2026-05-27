import { Extension, mergeAttributes, Node } from '@tiptap/core';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { NodeViewProps } from '@tiptap/react';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import {
  applyCommentAdd,
  applyCommentClose,
  COMMENT_CELL_NODE_TYPES,
  COMMENT_SECTION_NODE_TYPE,
  extractComments,
  normalizeDocumentComments,
  type TipTapDocument,
} from '@two-pebble/datatypes';
import { Icon } from '../content/icon/icon';

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

  addNodeView() {
    return ReactNodeViewRenderer(CommentSectionNodeView);
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
            const threadsByCellId = new Map<string, number>();
            for (const thread of extractComments(state.doc.toJSON() as TipTapDocument)) {
              threadsByCellId.set(thread.cellId, thread.comments.length);
            }
            if (threadsByCellId.size === 0) {
              return null;
            }
            const decorations: Decoration[] = [];
            state.doc.descendants((node, pos) => {
              const cellId = typeof node.attrs.cellId === 'string' ? node.attrs.cellId : '';
              const count = threadsByCellId.get(cellId);
              if (count === undefined) {
                return true;
              }
              decorations.push(
                Decoration.node(pos, pos + node.nodeSize, {
                  class: 'has-comment-thread',
                }),
              );
              decorations.push(
                Decoration.widget(
                  pos,
                  () => {
                    const element = document.createElement('span');
                    element.className = 'comment-thread-widget';
                    element.textContent = String(count);
                    element.setAttribute('aria-label', `${count} comments`);
                    return element;
                  },
                  { key: `comment-${cellId}`, side: -1 },
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

function CommentSectionNodeView(props: NodeViewProps) {
  const count = extractComments({
    type: 'doc',
    content: [{ type: COMMENT_SECTION_NODE_TYPE, attrs: props.node.attrs }],
  }).length;
  return (
    <NodeViewWrapper
      contentEditable={false}
      className="mt-6 flex items-center gap-1.5 border-t border-border pt-3 text-[11px] font-medium text-content-muted"
      data-comment-section="true"
    >
      <Icon name="messages-square" color="text-content-muted" className="h-3.5 w-3.5" />
      <span>{count === 0 ? 'No comment threads' : `${count} comment thread${count === 1 ? '' : 's'}`}</span>
    </NodeViewWrapper>
  );
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
