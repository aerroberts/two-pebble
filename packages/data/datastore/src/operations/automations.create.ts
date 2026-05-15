import type { AutomationIntervalUnit, AutomationRecord, DatastoreContext } from '../types';

type OperationHandlerInput = {
  agentRegistryId: string;
  enabled: boolean;
  intervalUnit: AutomationIntervalUnit;
  intervalValue: number;
  message: string;
  name: string;
};

export function automationsCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput): Promise<AutomationRecord> {
    const row = await ctx.database
      .insert(ctx.schema.automationsTable)
      .values({
        agentRegistryId: input.agentRegistryId,
        enabled: input.enabled,
        intervalUnit: input.intervalUnit,
        intervalValue: input.intervalValue,
        message: input.message,
        name: input.name,
      })
      .returning()
      .get();
    return row as AutomationRecord;
  };
}
