import { eq } from 'drizzle-orm';
import type { DatastoreContext, DocumentRecord } from '../types';

type OperationHandlerInput = {
  id: string;
};

export function documentsReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .select()
      .from(ctx.schema.documentsTable)
      .where(eq(ctx.schema.documentsTable.id, input.id))
      .get();

    if (row === undefined) {
      throw new Error(`Document not found: ${input.id}`);
    }

    return row as DocumentRecord;
  };
}
