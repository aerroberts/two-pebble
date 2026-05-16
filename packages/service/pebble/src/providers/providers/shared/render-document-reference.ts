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
 * provider prompts. Appends an `<open-tasks>` section listing only open
 * todos so the model knows which task ids it can act on via the
 * `progressive-task-list` capability tools. Terminal todos are skipped
 * to keep context lean.
 */
export function renderDocumentReferenceText(content: DocumentReferenceCellContent): string {
  const header = `[document: ${content.name} (id: ${content.documentId})]`;
  const body = content.contentSnapshot;
  const openTasksBlock = renderOpenTasksBlock(content.todos);
  if (openTasksBlock.length === 0) {
    return `${header}\n\n${body}`;
  }
  return `${header}\n\n${body}\n\n${openTasksBlock}`;
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
  return ['<open-tasks>', ...lines, '</open-tasks>'].join('\n');
}
