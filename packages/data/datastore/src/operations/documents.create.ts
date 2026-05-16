import type { DatastoreContext, DocumentRecord } from '../types';

const EMPTY_DOCUMENT_CONTENT = '{"type":"doc","content":[]}';

type OperationHandlerInput = {
  content?: string;
  name?: string;
  references?: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function documentsCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.documentsTable)
      .values({
        content: input.content ?? EMPTY_DOCUMENT_CONTENT,
        name: input.name ?? 'Untitled',
        ...(input.references === undefined ? {} : { references: input.references }),
      })
      .returning()
      .get();

    return row as DocumentRecord;
  };
}
