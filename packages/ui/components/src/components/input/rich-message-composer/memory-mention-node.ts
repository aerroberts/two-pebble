import { mergeAttributes, Node } from '@tiptap/core';

export interface MemoryMentionAttributes {
  memoryId: string;
  name: string;
}

export const MemoryMentionNode = Node.create({
  name: 'memoryMention',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      memoryId: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-memory-id') ?? '',
        renderHTML: (attributes) => ({ 'data-memory-id': attributes.memoryId }),
      },
      name: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-memory-name') ?? '',
        renderHTML: (attributes) => ({ 'data-memory-name': attributes.name }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-memory-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class:
          'inline-flex items-center align-baseline gap-1 rounded-md border border-border bg-surface px-1 py-0 text-[11px] font-medium leading-4 text-content',
        contenteditable: 'false',
      }),
      ['span', { class: 'text-content-muted', 'aria-hidden': 'true' }, 'mem:'],
      HTMLAttributes['data-memory-name'] || 'memory',
    ];
  },

  renderText({ node }) {
    const attrs = node.attrs as MemoryMentionAttributes;
    return `@${attrs.name}`;
  },
});
