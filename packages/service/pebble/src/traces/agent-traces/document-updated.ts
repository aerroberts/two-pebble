/**
 * Emitted when an agent edits an existing document via the document-writer
 * capability. Renders as a clickable entry in the agent trace view that
 * navigates to the affected document so the change can be inspected.
 */
export interface PebbleAgentDocumentUpdatedTrace {
  type: 'document-updated';
  data: {
    documentId: string;
    documentName: string;
  };
}
