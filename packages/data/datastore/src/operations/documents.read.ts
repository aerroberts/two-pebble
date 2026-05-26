import { and, eq, isNull } from 'drizzle-orm';
import type { DatastoreContext, DocumentRecord } from '../types';

type OperationHandlerInput = {
  id: string;
};

/**
 * Reads a single non-archived document.
 *
 * Archived rows are excluded so the same `archivedAt IS NULL` filter that
 * gates list queries also gates point reads. Otherwise a UI that refetches
 * a document right after archiving (e.g. a `useDocument` effect that
 * re-fires when the document leaves realtime state) would silently revive
 * the row in the client cache.
 */
export function documentsReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .select()
      .from(ctx.schema.documentsTable)
      .where(and(eq(ctx.schema.documentsTable.id, input.id), isNull(ctx.schema.documentsTable.archivedAt)))
      .get();

    if (row === undefined) {
      throw new Error(`Document not found: ${input.id}`);
    }

    return row as DocumentRecord;
  };
}
