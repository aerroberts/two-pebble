import { mergeAttributes, Node } from '@tiptap/core';

export interface TaskMentionAttributes {
  taskId: string;
  name: string;
}

/**
 * Inline atomic node that renders a task pill inside rich composer fields.
 */
export const TaskMentionNode = Node.create({
  name: 'taskMention',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      taskId: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-task-id') ?? '',
        renderHTML: (attributes) => ({ 'data-task-id': attributes.taskId }),
      },
      name: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-task-name') ?? '',
        renderHTML: (attributes) => ({ 'data-task-name': attributes.name }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-task-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class:
          'inline-flex items-center align-baseline gap-1 rounded-md border border-border bg-surface px-1 py-0 text-[11px] font-medium leading-4 text-content',
        contenteditable: 'false',
      }),
      ['span', { class: 'text-content-muted', 'aria-hidden': 'true' }, 'task:'],
      HTMLAttributes['data-task-name'] || 'task',
    ];
  },

  renderText({ node }) {
    const attrs = node.attrs as TaskMentionAttributes;
    return `!${attrs.name}`;
  },
});
