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
