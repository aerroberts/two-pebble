import { mergeAttributes, Node } from '@tiptap/core';
import type { NodeViewProps } from '@tiptap/react';
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';

export type TodoItemStatus = 'open' | 'completed' | 'invalid';
export type TodoItemCompletionType = 'manual' | 'automatic';

export interface TodoItemAttributes {
  id: string;
  status: TodoItemStatus;
  completionType?: TodoItemCompletionType;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    todoItem: {
      insertTodoItem: (options?: { text?: string }) => ReturnType;
      toggleTodoItem: () => ReturnType;
    };
  }
}

/**
 * Block-level node that renders an interactive checkbox + inline description.
 *
 * Each todo carries a stable `id` (generated at insertion) that survives
 * status toggles and rename edits. `extractTodos` in `@two-pebble/datatypes`
 * walks the document JSON looking for nodes with `type === 'todoItem'` and
 * uses these ids to seed the `progressive-task-list` capability.
 *
 * Only registered on the document `TipTapEditor` — chat composers do not
 * surface todos.
 */
export const TodoItemNode = Node.create({
  name: 'todoItem',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      id: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-todo-id') ?? '',
        renderHTML: (attributes) => ({ 'data-todo-id': attributes.id }),
      },
      status: {
        default: 'open' as TodoItemStatus,
        parseHTML: (element) => (element.getAttribute('data-todo-status') as TodoItemStatus | null) ?? 'open',
        renderHTML: (attributes) => ({ 'data-todo-status': attributes.status }),
      },
      completionType: {
        default: undefined as TodoItemCompletionType | undefined,
        parseHTML: (element) =>
          (element.getAttribute('data-todo-completion') as TodoItemCompletionType | null) ?? undefined,
        renderHTML: (attributes) => {
          if (attributes.completionType === undefined) {
            return {};
          }
          return { 'data-todo-completion': attributes.completionType };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'li[data-todo-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'li',
      mergeAttributes(HTMLAttributes, {
        class: 'two-pebble-todo-item flex items-start gap-2 list-none my-1',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      insertTodoItem:
        (options) =>
        ({ commands }) => {
          const content: { type: 'text'; text: string }[] =
            options?.text !== undefined && options.text.length > 0 ? [{ type: 'text', text: options.text }] : [];
          return commands.insertContent({
            type: 'todoItem',
            attrs: { id: generateTodoId(), status: 'open' },
            content,
          });
        },
      toggleTodoItem:
        () =>
        ({ state, commands }) => {
          const node = findTodoItemAtSelection(state);
          if (node === null) {
            return false;
          }
          const nextStatus: TodoItemStatus = node.node.attrs.status === 'completed' ? 'open' : 'completed';
          return commands.updateAttributes('todoItem', {
            status: nextStatus,
            ...(nextStatus === 'completed' ? { completionType: 'manual' } : { completionType: undefined }),
          });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => this.editor.commands.toggleTodoItem(),
      Enter: () => {
        const node = findTodoItemAtSelection(this.editor.state);
        if (node === null) {
          return false;
        }
        if (node.node.textContent.length > 0) {
          return this.editor.commands.insertTodoItem();
        }
        // Empty todo on Enter → exit to a paragraph.
        return this.editor.commands.command(({ tr, state, dispatch }) => {
          const { $from } = state.selection;
          const range = { from: $from.before($from.depth), to: $from.after($from.depth) };
          tr.deleteRange(range.from, range.to);
          tr.insert(range.from, state.schema.nodes.paragraph.create());
          if (dispatch !== undefined) {
            dispatch(tr);
          }
          return true;
        });
      },
      Backspace: () => {
        const node = findTodoItemAtSelection(this.editor.state);
        if (node === null) {
          return false;
        }
        if (node.node.textContent.length > 0) {
          return false;
        }
        return this.editor.commands.command(({ tr, state, dispatch }) => {
          const { $from } = state.selection;
          const range = { from: $from.before($from.depth), to: $from.after($from.depth) };
          tr.deleteRange(range.from, range.to);
          tr.insert(range.from, state.schema.nodes.paragraph.create());
          if (dispatch !== undefined) {
            dispatch(tr);
          }
          return true;
        });
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(TodoItemNodeView);
  },
});

function TodoItemNodeView(props: NodeViewProps) {
  const status = (props.node.attrs.status as TodoItemStatus) ?? 'open';
  const completed = status === 'completed';
  const invalid = status === 'invalid';
  return (
    <NodeViewWrapper
      as="li"
      className="two-pebble-todo-item my-1 flex list-none items-start gap-2"
      data-todo-id={props.node.attrs.id}
      data-todo-status={status}
    >
      <span contentEditable={false} className="mt-1 select-none">
        <input
          aria-label="Toggle task"
          type="checkbox"
          checked={completed}
          className="h-4 w-4 rounded-md border border-border bg-surface accent-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          onChange={(event) => {
            const next: TodoItemStatus = event.target.checked ? 'completed' : 'open';
            props.updateAttributes({
              status: next,
              ...(next === 'completed' ? { completionType: 'manual' } : { completionType: undefined }),
            });
          }}
        />
      </span>
      <NodeViewContent
        as="span"
        className={`flex-1 outline-none ${completed ? 'text-content-muted line-through' : ''} ${invalid ? 'text-content-muted italic' : ''}`}
      />
    </NodeViewWrapper>
  );
}

interface FoundTodo {
  node: import('@tiptap/pm/model').Node;
  pos: number;
}

function findTodoItemAtSelection(state: import('@tiptap/pm/state').EditorState): FoundTodo | null {
  const { $from } = state.selection;
  for (let depth = $from.depth; depth >= 0; depth--) {
    const node = $from.node(depth);
    if (node.type.name === 'todoItem') {
      return { node, pos: $from.before(depth) };
    }
  }
  return null;
}

const TODO_ID_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/**
 * ULID-flavoured id (Crockford alphabet, 26 chars) without an external
 * dependency. Stable across status toggles and survives document
 * round-trip via the `data-todo-id` attribute.
 */
export function generateTodoId(): string {
  const time = Date.now();
  const timeBytes: string[] = [];
  let remaining = time;
  for (let i = 0; i < 10; i++) {
    timeBytes.unshift(TODO_ID_ALPHABET[remaining % 32]);
    remaining = Math.floor(remaining / 32);
  }
  let random = '';
  for (let i = 0; i < 16; i++) {
    random += TODO_ID_ALPHABET[Math.floor(Math.random() * 32)];
  }
  return timeBytes.join('') + random;
}
