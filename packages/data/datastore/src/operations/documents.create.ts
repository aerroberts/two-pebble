import { createEmptyTipTapDocument, validateDocumentContent } from '@two-pebble/datatypes';
import type { DatastoreContext, DocumentRecord } from '../types';

const EMPTY_DOCUMENT_CONTENT = JSON.stringify(createEmptyTipTapDocument());

type OperationHandlerInput = {
  content?: string;
  name?: string;
  projectId: string;
  references?: string;
  section?: string | null;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function documentsCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    if (input.content !== undefined) {
      validateDocumentContent(input.content);
    }
    const row = await ctx.database
      .insert(ctx.schema.documentsTable)
      .values({
        content: input.content ?? EMPTY_DOCUMENT_CONTENT,
        name: input.name ?? 'Untitled',
        projectId: input.projectId,
        ...(input.references === undefined ? {} : { references: input.references }),
        ...(input.section === undefined ? {} : { section: input.section }),
      })
      .returning()
      .get();

    return row as DocumentRecord;
  };
}
