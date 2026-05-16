import type { DocumentTodo } from '@two-pebble/datatypes';

export interface DocumentReferenceCellInput {
  documentId: string;
  name: string;
  contentSnapshot: string;
  documentUpdatedAt: number;
  /**
   * Full list of todos extracted from the document content (open,
   * completed, and invalid). Populated by `resolveDocumentReferenceCells`
   * when the document body contains `todoItem` nodes. Downstream
   * consumers filter as needed; provider renderers surface only open
   * todos to the model.
   */
  todos?: DocumentTodo[];
}

export function documentReference(input: DocumentReferenceCellInput) {
  return {
    type: 'documentReference' as const,
    content: {
      documentId: input.documentId,
      name: input.name,
      contentSnapshot: input.contentSnapshot,
      documentUpdatedAt: input.documentUpdatedAt,
      ...(input.todos === undefined ? {} : { todos: input.todos }),
    },
  };
}
