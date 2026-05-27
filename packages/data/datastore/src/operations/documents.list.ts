import { and, count, desc, eq, isNull } from 'drizzle-orm';
import type { DatastoreContext, DocumentRecord } from '../types';

type OperationHandlerInput = {
  limit: number;
  offset: number;
  projectId?: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function documentsListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const where =
      input.projectId === undefined
        ? isNull(ctx.schema.documentsTable.archivedAt)
        : and(eq(ctx.schema.documentsTable.projectId, input.projectId), isNull(ctx.schema.documentsTable.archivedAt));
    const rows = await ctx.database
      .select()
      .from(ctx.schema.documentsTable)
      .where(where)
      .orderBy(desc(ctx.schema.documentsTable.updatedAt))
      .limit(input.limit)
      .offset(input.offset)
      .all();
    const total =
      (await ctx.database.select({ value: count() }).from(ctx.schema.documentsTable).where(where).get())?.value ?? 0;

    return {
      items: rows as DocumentRecord[],
      page: {
        limit: input.limit,
        offset: input.offset,
        total,
      },
    };
  };
}
