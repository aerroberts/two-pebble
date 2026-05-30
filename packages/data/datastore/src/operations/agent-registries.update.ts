import { parseAgentSystemPrompt, serializeAgentSystemPrompt, type TipTapDocument } from '@two-pebble/datatypes';
import { eq } from 'drizzle-orm';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  capabilities?: string;
  id: string;
  inferenceProfileId?: string | null;
  name?: string;
  quickActionEnabled?: boolean;
  systemPrompt?: TipTapDocument;
  thirdPartyAgentInstallId?: string | null;
  workspaceConfig?: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function agentRegistriesUpdateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.agentRegistriesTable)
      .where(eq(ctx.schema.agentRegistriesTable.id, input.id))
      .get();

    if (existing === undefined) {
      throw new Error(`Agent registry not found: ${input.id}`);
    }

    const row = await ctx.database
      .update(ctx.schema.agentRegistriesTable)
      .set({
        capabilities: input.capabilities ?? existing.capabilities,
        inferenceProfileId:
          input.inferenceProfileId === undefined ? existing.inferenceProfileId : input.inferenceProfileId,
        name: input.name ?? existing.name,
        quickActionEnabled: input.quickActionEnabled ?? existing.quickActionEnabled,
        systemPrompt:
          input.systemPrompt === undefined ? existing.systemPrompt : serializeAgentSystemPrompt(input.systemPrompt),
        thirdPartyAgentInstallId:
          input.thirdPartyAgentInstallId === undefined
            ? existing.thirdPartyAgentInstallId
            : input.thirdPartyAgentInstallId,
        workspaceConfig: input.workspaceConfig ?? existing.workspaceConfig,
      })
      .where(eq(ctx.schema.agentRegistriesTable.id, input.id))
      .returning()
      .get();

    return {
      ...row,
      systemPrompt: parseAgentSystemPrompt(row.systemPrompt),
      kind: row.thirdPartyAgentInstallId !== null ? ('framework' as const) : ('pebble' as const),
    };
  };
}
