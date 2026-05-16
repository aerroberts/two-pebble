/**
 * Emitted when an agent creates a new document via the document-writer
 * capability. Renders as a clickable entry in the agent trace view that
 * navigates to the created document.
 */
export interface PebbleAgentDocumentCreatedTrace {
  type: 'document-created';
  data: {
    documentId: string;
    documentName: string;
  };
}
