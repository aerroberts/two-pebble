import type { DocumentTodo, DocumentTodoCompletionType, DocumentTodoStatus } from '@two-pebble/datatypes';

/**
 * Contract the `document-writer` capability uses to perform document
 * operations. The daemon installs an implementation that owns the agent
 * id, so capability tools don't have to thread it through every call —
 * any write made via this runner is back-linked to the owning agent
 * automatically.
 */
export interface DocumentRunner {
  createDocument(input: DocumentCreateInput): Promise<DocumentSummary>;
  updateDocument(input: DocumentUpdateInput): Promise<DocumentSummary>;
  readDocument(input: DocumentReadInput): Promise<DocumentReadOutput>;
  listDocuments(input: DocumentListInput): Promise<DocumentListOutput>;
  /**
   * Reads a document and returns the flattened todo list extracted from
   * its TipTap JSON body. Used by the `progressive-task-list` capability
   * each turn when bound to a document, so the agent's task slot stays
   * in sync with edits made in the document editor.
   */
  readDocumentTodos(input: DocumentReadInput): Promise<DocumentTodo[]>;
  /**
   * Updates a single todo's status (and optional `completionType`) inside
   * the document's TipTap JSON body. Used by `mark-task-complete` and
   * `mark-task-invalid` so toggling a task in chat reflects back into the
   * document. Throws when the todo id is not present in the document.
   */
  applyTodoStatus(input: DocumentApplyTodoStatusInput): Promise<void>;
}

export interface DocumentCreateInput {
  name: string;
  markdown: string;
}

export interface DocumentUpdateInput {
  id: string;
  markdown: string;
  name?: string;
}

export interface DocumentReadInput {
  id: string;
}

export interface DocumentListInput {
  limit?: number;
  offset?: number;
}

export interface DocumentApplyTodoStatusInput {
  id: string;
  todoId: string;
  status: DocumentTodoStatus;
  completionType?: DocumentTodoCompletionType;
}

export interface DocumentSummary {
  id: string;
  name: string;
}

export interface DocumentReadOutput {
  id: string;
  name: string;
  markdown: string;
}

export interface DocumentListEntry {
  id: string;
  name: string;
  updatedAt: number;
}

export interface DocumentListOutput {
  items: DocumentListEntry[];
  total: number;
}
