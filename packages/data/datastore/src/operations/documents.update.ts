import { validateDocumentContent } from '@two-pebble/datatypes';
import { eq } from 'drizzle-orm';
import type { DatastoreContext, DocumentRecord } from '../types';

type OperationHandlerInput = {
  content?: string;
  id: string;
  name?: string;
  references?: string;
  section?: string | null;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function documentsUpdateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.documentsTable)
      .where(eq(ctx.schema.documentsTable.id, input.id))
      .get();

    if (existing === undefined) {
      throw new Error(`Document not found: ${input.id}`);
    }
    if (input.content !== undefined) {
      validateDocumentContent(input.content);
    }

    const row = await ctx.database
      .update(ctx.schema.documentsTable)
      .set({
        content: input.content ?? existing.content,
        name: input.name ?? existing.name,
        references: input.references ?? existing.references,
        // `undefined` keeps the existing value; `null` clears it explicitly.
        section: input.section === undefined ? existing.section : input.section,
      })
      .where(eq(ctx.schema.documentsTable.id, input.id))
      .returning()
      .get();

    return row as DocumentRecord;
  };
}
