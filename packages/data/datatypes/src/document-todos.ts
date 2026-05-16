import type { TipTapAttrs, TipTapDocument, TipTapNode } from './document-content';

/**
 * Status values stored on TipTap todo item nodes.
 * `invalid` represents malformed or unrecognized source state that callers
 * can surface without treating it as completed work.
 */
export type DocumentTodoStatus = 'open' | 'completed' | 'invalid';

/**
 * Completion source recorded when a todo transitions to completed.
 * Manual completions come from explicit user action; automatic completions
 * are applied by higher-level automation.
 */
export type DocumentTodoCompletionType = 'manual' | 'automatic';

/**
 * Flattened todo record extracted from a rich-text document.
 * The record carries the node id, normalized status, display text, and an
 * optional completion source when the source node provides one.
 */
export interface DocumentTodo {
  id: string;
  status: DocumentTodoStatus;
  text: string;
  completionType?: DocumentTodoCompletionType;
}

/**
 * Walks a TipTap document and flattens every `todoItem` node into a
 * `DocumentTodo`. Skips nodes that are missing an `id`. Inline text is
 * concatenated in document order; structural inline nodes (mentions,
 * code marks) contribute their `text` if present and are otherwise
 * dropped.
 */
export function extractTodos(doc: TipTapDocument | null | undefined): DocumentTodo[] {
  if (doc === null || doc === undefined) {
    return [];
  }
  const todos: DocumentTodo[] = [];
  walk(doc as TipTapNode, todos);
  return todos;
}

/**
 * Returns a new document with the matching todo's status (and optional
 * completionType) updated. The rest of the tree is preserved by
 * reference. Returns the input unchanged when no todo with `id` exists.
 */
export function applyTodoStatus(
  doc: TipTapDocument,
  id: string,
  status: DocumentTodoStatus,
  completionType?: DocumentTodoCompletionType,
): TipTapDocument {
  let mutated = false;
  const nextContent = (doc.content ?? []).map((node) => {
    const result = updateNode(node, id, status, completionType);
    if (result !== node) {
      mutated = true;
    }
    return result;
  });
  if (!mutated) {
    return doc;
  }
  return { ...doc, content: nextContent };
}

function walk(node: TipTapNode, out: DocumentTodo[]): void {
  if (node.type === 'todoItem') {
    const attrs = node.attrs ?? {};
    const id = typeof attrs.id === 'string' ? attrs.id : '';
    if (id.length > 0) {
      const rawStatus = typeof attrs.status === 'string' ? attrs.status : 'open';
      const status: DocumentTodoStatus =
        rawStatus === 'open' || rawStatus === 'completed' || rawStatus === 'invalid' ? rawStatus : 'open';
      const completionType =
        attrs.completionType === 'manual' || attrs.completionType === 'automatic' ? attrs.completionType : undefined;
      const todo: DocumentTodo = {
        id,
        status,
        text: collectInlineText(node).trim(),
        ...(completionType === undefined ? {} : { completionType }),
      };
      out.push(todo);
    }
    return;
  }
  for (const child of node.content ?? []) {
    walk(child, out);
  }
}

function collectInlineText(node: TipTapNode): string {
  if (typeof node.text === 'string') {
    return node.text;
  }
  let buffer = '';
  for (const child of node.content ?? []) {
    buffer += collectInlineText(child);
  }
  return buffer;
}

function updateNode(
  node: TipTapNode,
  id: string,
  status: DocumentTodoStatus,
  completionType: DocumentTodoCompletionType | undefined,
): TipTapNode {
  if (node.type === 'todoItem' && typeof node.attrs?.id === 'string' && node.attrs.id === id) {
    const nextAttrs: TipTapAttrs = { ...(node.attrs ?? {}), status };
    if (completionType === undefined) {
      delete nextAttrs.completionType;
    } else {
      nextAttrs.completionType = completionType;
    }
    return { ...node, attrs: nextAttrs };
  }
  if (node.content === undefined) {
    return node;
  }
  let childMutated = false;
  const nextChildren = node.content.map((child) => {
    const result = updateNode(child, id, status, completionType);
    if (result !== child) {
      childMutated = true;
    }
    return result;
  });
  if (!childMutated) {
    return node;
  }
  return { ...node, content: nextChildren };
}
