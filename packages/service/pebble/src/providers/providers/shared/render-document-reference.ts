import type { DocumentTodo } from '@two-pebble/datatypes';

/**
 * Public shape of a resolved `documentReference` cell's content. The
 * provider render path consumes this directly and other modules may
 * type their own data against it.
 */
export interface DocumentReferenceCellContent {
  documentId: string;
  name: string;
  contentSnapshot: string;
  documentUpdatedAt: number;
  todos?: DocumentTodo[];
}

/**
 * Serializes a `documentReference` cell into a plain-text block for
 * provider prompts.
 *
 * The reference body is wrapped in `{begin referenced document: name}`
 * / `{end referenced document}` markers (and any open-task list in
 * `{begin open tasks}` / `{end open tasks}`) instead of XML-style tags
 * so the resulting text plays nicely with markdown renderers.
 */
export function renderDocumentReferenceText(content: DocumentReferenceCellContent): string {
  const header = `{begin referenced document: ${content.name} (id: ${content.documentId})}`;
  const footer = '{end referenced document}';
  const body = content.contentSnapshot;
  const openTasksBlock = renderOpenTasksBlock(content.todos);
  if (openTasksBlock.length === 0) {
    return `${header}\n\n${body}\n\n${footer}`;
  }
  return `${header}\n\n${body}\n\n${openTasksBlock}\n\n${footer}`;
}

function renderOpenTasksBlock(todos: DocumentTodo[] | undefined): string {
  if (todos === undefined || todos.length === 0) {
    return '';
  }
  const openTodos = todos.filter((todo) => todo.status === 'open');
  if (openTodos.length === 0) {
    return '';
  }
  const lines = openTodos.map((todo) => `- id=${todo.id} status=${todo.status} "${todo.text}"`);
  return ['{begin open tasks}', ...lines, '{end open tasks}'].join('\n');
}
