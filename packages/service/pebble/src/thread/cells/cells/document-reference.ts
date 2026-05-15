export interface DocumentReferenceCellInput {
  documentId: string;
  name: string;
  contentSnapshot: string;
  documentUpdatedAt: number;
}

export function documentReference(input: DocumentReferenceCellInput) {
  return {
    type: 'documentReference' as const,
    content: {
      documentId: input.documentId,
      name: input.name,
      contentSnapshot: input.contentSnapshot,
      documentUpdatedAt: input.documentUpdatedAt,
    },
  };
}
