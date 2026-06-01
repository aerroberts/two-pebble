import { Extension, mergeAttributes, Node } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { type EditorState, Plugin, PluginKey, type Transaction } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import {
  applyCommentAdd,
  applyCommentClose,
  COMMENT_CELL_NODE_TYPES,
  COMMENT_SECTION_NODE_TYPE,
  type CommentThread,
  extractComments,
  generateCellId,
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
        ({ editor, state, dispatch }) => {
          const next = applyCommentAdd(editor.getJSON() as TipTapDocument, input);
          return writeCommentSectionThreads(state, dispatch, extractComments(next));
        },
      closeCommentThread:
        (input) =>
        ({ editor, state, dispatch }) => {
          const next = applyCommentClose(editor.getJSON() as TipTapDocument, input);
          return writeCommentSectionThreads(state, dispatch, extractComments(next));
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

/**
 * Brings the document to the comment invariants — every comment-eligible cell
 * carries a unique cellId, and exactly one comment section (holding all
 * threads) sits as the last node — using minimal, position-preserving steps.
 *
 * The previous implementation rebuilt the entire document and `replaceWith`-d
 * it on every transaction, which discarded ProseMirror's selection mapping and
 * jumped the cursor to the end (the worst on a plain Enter, which creates a
 * cellId-less paragraph and so triggered a full rebuild). cellId assignment is
 * now an attribute-only `setNodeMarkup`, which never shifts positions; the rare
 * section consolidation only edits the document tail, after the selection.
 */
export function normalizeEditorDocument(state: EditorState, dispatch?: (tr: Transaction) => void): Transaction | null {
  const tr = state.tr;
  const seenCellIds = new Set<string>();

  state.doc.descendants((node, pos) => {
    if (!COMMENT_CELL_NODE_TYPES.has(node.type.name)) {
      return true;
    }
    const rawCellId = typeof node.attrs.cellId === 'string' ? node.attrs.cellId : '';
    let cellId = rawCellId;
    if (cellId.length === 0 || seenCellIds.has(cellId)) {
      cellId = generateCellId();
      tr.setNodeMarkup(pos, undefined, { ...node.attrs, cellId });
    }
    seenCellIds.add(cellId);
    return true;
  });

  const sections: { pos: number; node: ProseMirrorNode }[] = [];
  state.doc.forEach((node, offset) => {
    if (node.type.name === COMMENT_SECTION_NODE_TYPE) {
      sections.push({ pos: offset, node });
    }
  });
  const mergedThreads = mergeCommentThreads(sections.map((entry) => entry.node));
  const lastChild = state.doc.lastChild;
  const isWellFormed =
    sections.length === 1 &&
    lastChild !== null &&
    lastChild.type.name === COMMENT_SECTION_NODE_TYPE &&
    JSON.stringify(sections[0]?.node.attrs.threads ?? []) === JSON.stringify(mergedThreads);

  if (!isWellFormed) {
    // Drop existing sections right-to-left so the earlier original positions
    // stay valid (the attribute-only steps above do not change sizes), then
    // append one consolidated section at the document tail.
    for (let index = sections.length - 1; index >= 0; index--) {
      const entry = sections[index];
      if (entry !== undefined) {
        tr.delete(entry.pos, entry.pos + entry.node.nodeSize);
      }
    }
    const sectionType = state.schema.nodes[COMMENT_SECTION_NODE_TYPE];
    if (sectionType !== undefined) {
      tr.insert(tr.doc.content.size, sectionType.create({ threads: mergedThreads }));
    }
  }

  if (!tr.docChanged) {
    return null;
  }
  tr.setMeta('addToHistory', false);
  if (dispatch !== undefined) {
    dispatch(tr);
    return null;
  }
  return tr;
}

/**
 * Replaces the trailing comment section's threads in place via an attribute
 * step (creating the section if absent) so the user's selection is preserved.
 */
function writeCommentSectionThreads(
  state: EditorState,
  dispatch: ((tr: Transaction) => void) | undefined,
  threads: CommentThread[],
): boolean {
  const sections: { pos: number; node: ProseMirrorNode }[] = [];
  state.doc.forEach((node, offset) => {
    if (node.type.name === COMMENT_SECTION_NODE_TYPE) {
      sections.push({ pos: offset, node });
    }
  });
  const section = sections[sections.length - 1];
  const tr = state.tr;
  if (section === undefined) {
    const sectionType = state.schema.nodes[COMMENT_SECTION_NODE_TYPE];
    if (sectionType === undefined) {
      return false;
    }
    tr.insert(state.doc.content.size, sectionType.create({ threads }));
  } else {
    tr.setNodeMarkup(section.pos, undefined, { ...section.node.attrs, threads });
  }
  if (dispatch !== undefined) {
    dispatch(tr);
  }
  return true;
}

function mergeCommentThreads(sections: ProseMirrorNode[]): CommentThread[] {
  const seen = new Set<string>();
  const threads: CommentThread[] = [];
  for (const section of sections) {
    const list = Array.isArray(section.attrs.threads) ? (section.attrs.threads as CommentThread[]) : [];
    for (const thread of list) {
      const cellId = typeof thread?.cellId === 'string' ? thread.cellId : '';
      if (cellId.length > 0 && !seen.has(cellId)) {
        seen.add(cellId);
        threads.push(thread);
      }
    }
  }
  return threads;
}
