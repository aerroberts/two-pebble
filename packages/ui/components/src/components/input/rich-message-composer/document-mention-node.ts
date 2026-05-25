import { mergeAttributes, Node } from '@tiptap/core';

export interface DocumentMentionAttributes {
  documentId: string;
  name: string;
}

/**
 * Inline atomic node that renders a document pill inside the composer.
 *
 * The node carries `{ documentId, name }` in its TipTap attrs and is the
 * only structured node `tipTapDocToCells` knows how to convert into a
 * `documentReference` data cell. Selection treats it as a single character.
 */
export const DocumentMentionNode = Node.create({
  name: 'documentMention',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      documentId: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-document-id') ?? '',
        renderHTML: (attributes) => ({ 'data-document-id': attributes.documentId }),
      },
      name: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-document-name') ?? '',
        renderHTML: (attributes) => ({ 'data-document-name': attributes.name }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-document-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class:
          'inline-flex items-center align-baseline gap-1 rounded-md border border-border bg-surface-alt px-1 py-0 text-[11px] font-medium leading-4 text-content',
        contenteditable: 'false',
      }),
      ['span', { class: 'text-content-muted', 'aria-hidden': 'true' }, 'doc:'],
      HTMLAttributes['data-document-name'] || 'document',
    ];
  },

  renderText({ node }) {
    const attrs = node.attrs as DocumentMentionAttributes;
    return `@${attrs.name}`;
  },
});
