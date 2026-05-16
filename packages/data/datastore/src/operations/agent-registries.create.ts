import { serializeAgentSystemPrompt, type TipTapDocument } from '@two-pebble/datatypes';
import { attachDerivedAgentRegistryKind } from '../operation-support/agent-registries-utils';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  capabilities?: string;
  inferenceProfileId?: string | null;
  name: string;
  systemPrompt: TipTapDocument;
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
        systemPrompt: serializeAgentSystemPrompt(input.systemPrompt),
        thirdPartyAgentInstallId: input.thirdPartyAgentInstallId ?? null,
        workspaceConfig: input.workspaceConfig ?? '{"kind":"cwd"}',
      })
      .returning()
      .get();

    return attachDerivedAgentRegistryKind(row);
  };
}
