import { documentUpdateConflictError, validateDocumentContent } from '@two-pebble/datatypes';
import { and, eq } from 'drizzle-orm';
import type { DatastoreContext, DocumentRecord } from '../types';

type OperationHandlerInput = {
  content?: string;
  id: string;
  name?: string;
  references?: string;
  section?: string | null;
  /**
   * Compare-and-swap guard. When provided, the write only lands if the stored
   * row's `updatedAt` still equals this value. A mismatch means the document
   * changed since the caller loaded it (another tab or an agent edit), so the
   * write is rejected with a conflict instead of clobbering the newer content.
   * Omit it for writes that should unconditionally win (rename, section moves,
   * server-side reference updates).
   */
  expectedUpdatedAt?: number;
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

    // When a base revision is supplied, key the write on it so the update is
    // a no-op if another writer moved the row first. The `updatedAt` predicate
    // makes the check-and-write atomic at the database, closing the gap between
    // the read above and the write below.
    const matchesRevision =
      input.expectedUpdatedAt === undefined
        ? eq(ctx.schema.documentsTable.id, input.id)
        : and(
            eq(ctx.schema.documentsTable.id, input.id),
            eq(ctx.schema.documentsTable.updatedAt, input.expectedUpdatedAt),
          );

    const row = await ctx.database
      .update(ctx.schema.documentsTable)
      .set({
        content: input.content ?? existing.content,
        name: input.name ?? existing.name,
        references: input.references ?? existing.references,
        // `undefined` keeps the existing value; `null` clears it explicitly.
        section: input.section === undefined ? existing.section : input.section,
      })
      .where(matchesRevision)
      .returning()
      .get();

    // The row exists (checked above), so a missing result here means the
    // revision predicate failed: the document changed under the caller.
    if (row === undefined) {
      throw documentUpdateConflictError(input.id);
    }

    return row as DocumentRecord;
  };
}
