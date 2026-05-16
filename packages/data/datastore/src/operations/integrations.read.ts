import { eq } from 'drizzle-orm';
import type { DatastoreContext, IntegrationRecord } from '../types';

type OperationHandlerInput = {
  id: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function integrationsReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .select()
      .from(ctx.schema.integrationsTable)
      .where(eq(ctx.schema.integrationsTable.id, input.id))
      .get();

    if (row === undefined) {
      throw new Error(`Integration not found: ${input.id}`);
    }

    return row as IntegrationRecord;
  };
}
