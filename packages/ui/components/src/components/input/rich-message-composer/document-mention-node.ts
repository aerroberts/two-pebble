import { mergeAttributes, Node } from '@tiptap/core';

export interface DocumentMentionAttributes {
  documentId: string;
  name: string;
}

const DOCUMENT_ICON_SVG: [string, Record<string, string>, ...unknown[]] = [
  'svg',
  {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
    class: 'h-2.5 w-2.5 shrink-0',
  },
  ['path', { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' }],
  ['path', { d: 'M14 2v4a2 2 0 0 0 2 2h4' }],
  ['path', { d: 'M10 9H8' }],
  ['path', { d: 'M16 13H8' }],
  ['path', { d: 'M16 17H8' }],
];

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
      DOCUMENT_ICON_SVG,
      HTMLAttributes['data-document-name'] || 'document',
    ];
  },

  renderText({ node }) {
    const attrs = node.attrs as DocumentMentionAttributes;
    return `@${attrs.name}`;
  },
});
