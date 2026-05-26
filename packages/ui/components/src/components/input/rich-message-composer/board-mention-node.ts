import { mergeAttributes, Node } from '@tiptap/core';

export interface BoardMentionAttributes {
  boardId: string;
  name: string;
}

/**
 * Inline atomic node that renders a task-board pill inside the composer.
 *
 * The node carries `{ boardId, name }` in TipTap attrs and converts to a
 * `boardReference` data cell when the composer commits.
 */
export const BoardMentionNode = Node.create({
  name: 'boardMention',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      boardId: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-board-id') ?? '',
        renderHTML: (attributes) => ({ 'data-board-id': attributes.boardId }),
      },
      name: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-board-name') ?? '',
        renderHTML: (attributes) => ({ 'data-board-name': attributes.name }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-board-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class:
          'inline-flex items-center align-baseline gap-1 rounded-md border border-border bg-surface px-1 py-0 text-[11px] font-medium leading-4 text-content',
        contenteditable: 'false',
      }),
      ['span', { class: 'text-content-muted', 'aria-hidden': 'true' }, 'board:'],
      HTMLAttributes['data-board-name'] || 'board',
    ];
  },

  renderText({ node }) {
    const attrs = node.attrs as BoardMentionAttributes;
    return `#${attrs.name}`;
  },
});
