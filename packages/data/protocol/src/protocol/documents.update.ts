/**
 * Defines the UpdateDocumentOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface UpdateDocumentOperation {
  name: 'updateDocument';
  request: {
    content?: string;
    id: string;
    name?: string;
    /** Pass `undefined` to leave the section alone; `null` clears it; any string moves the doc into that section. */
    section?: string | null;
    /**
     * Base revision (`updatedAt`) the edit was made from. When present, the
     * write only lands if the stored document still has this revision;
     * otherwise it is rejected as a conflict so a stale client cannot
     * overwrite a newer edit. Content saves from the editor pass it; rename
     * and section moves omit it.
     */
    expectedUpdatedAt?: number;
  };
  response: DocumentRecord;
}

/**
 * Defines the DocumentRecord protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface DocumentRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  projectId?: string;
  content: string;
  references: string;
  /**
   * Sidebar grouping label. `null` keeps the document in the default
   * top-level bucket; any other string puts it in a named section that the
   * sidebar collapses other documents under.
   */
  section: string | null;
}
