import { attachDerivedAgentRegistryKind } from '../operation-support/agent-registries-utils';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  capabilities?: string;
  inferenceProfileId?: string | null;
  name: string;
  systemPrompt: string;
  thirdPartyAgentInstallId?: string | null;
  workspaceConfig?: string;
};

export function agentRegistriesCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.agentRegistriesTable)
      .values({
        capabilities: input.capabilities ?? '[]',
        inferenceProfileId: input.inferenceProfileId ?? null,
        name: input.name,
        systemPrompt: input.systemPrompt,
        thirdPartyAgentInstallId: input.thirdPartyAgentInstallId ?? null,
        workspaceConfig: input.workspaceConfig ?? '{"kind":"cwd"}',
      })
      .returning()
      .get();

    return attachDerivedAgentRegistryKind(row);
  };
}
