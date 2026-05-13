import { eq } from 'drizzle-orm';
import type { DatastoreContext } from '../types';
import { attachDerivedAgentRegistryKind } from './agent-registries-utils';

type OperationHandlerInput = {
  capabilities?: string;
  id: string;
  inferenceProfileId?: string | null;
  name?: string;
  systemPrompt?: string;
  thirdPartyAgentInstallId?: string | null;
  workspaceConfig?: string;
};

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
        systemPrompt: input.systemPrompt ?? existing.systemPrompt,
        thirdPartyAgentInstallId:
          input.thirdPartyAgentInstallId === undefined
            ? existing.thirdPartyAgentInstallId
            : input.thirdPartyAgentInstallId,
        workspaceConfig: input.workspaceConfig ?? existing.workspaceConfig,
      })
      .where(eq(ctx.schema.agentRegistriesTable.id, input.id))
      .returning()
      .get();

    return attachDerivedAgentRegistryKind(row);
  };
}
