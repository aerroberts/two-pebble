import { mergeAttributes, Node } from '@tiptap/core';

export interface SkillMentionAttributes {
  skillId: string;
  name: string;
}

/**
 * Inline atomic node that renders a skill pill inside the composer.
 *
 * The node carries `{ skillId, name }` in TipTap attrs and converts to a
 * `skillReference` data cell when the composer commits. Compose-time
 * captures only id + name; the daemon resolve layer fills the rest.
 */
export const SkillMentionNode = Node.create({
  name: 'skillMention',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      skillId: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-skill-id') ?? '',
        renderHTML: (attributes) => ({ 'data-skill-id': attributes.skillId }),
      },
      name: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-skill-name') ?? '',
        renderHTML: (attributes) => ({ 'data-skill-name': attributes.name }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-skill-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class:
          'inline-flex items-center align-baseline gap-1 rounded-md border border-border bg-surface px-1 py-0 text-[11px] font-medium leading-4 text-content',
        contenteditable: 'false',
      }),
      ['span', { class: 'text-content-muted', 'aria-hidden': 'true' }, 'skill:'],
      HTMLAttributes['data-skill-name'] || 'skill',
    ];
  },

  renderText({ node }) {
    const attrs = node.attrs as SkillMentionAttributes;
    return `*${attrs.name}`;
  },
});
