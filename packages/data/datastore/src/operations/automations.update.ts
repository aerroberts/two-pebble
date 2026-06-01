import { eq } from 'drizzle-orm';

import type { AutomationIntervalUnit, AutomationRecord, DatastoreContext } from '../types';

type OperationHandlerInput = {
  agentRegistryId?: string;
  enabled?: boolean;
  id: string;
  intervalUnit?: AutomationIntervalUnit;
  intervalValue?: number;
  message?: string;
  name?: string;
  projectId?: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function automationsUpdateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput): Promise<AutomationRecord> {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.automationsTable)
      .where(eq(ctx.schema.automationsTable.id, input.id))
      .get();
    if (existing === undefined) {
      throw new Error(`Automation not found: ${input.id}`);
    }
    const row = await ctx.database
      .update(ctx.schema.automationsTable)
      .set({
        agentRegistryId: input.agentRegistryId ?? existing.agentRegistryId,
        enabled: input.enabled ?? existing.enabled,
        intervalUnit: input.intervalUnit ?? existing.intervalUnit,
        intervalValue: input.intervalValue ?? existing.intervalValue,
        message: input.message ?? existing.message,
        name: input.name ?? existing.name,
        projectId: input.projectId ?? existing.projectId,
      })
      .where(eq(ctx.schema.automationsTable.id, input.id))
      .returning()
      .get();
    return row as AutomationRecord;
  };
}
