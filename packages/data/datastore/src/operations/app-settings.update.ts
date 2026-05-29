import { eq } from 'drizzle-orm';
import type { AppSettingsRecord, DatastoreContext } from '../types';

type OperationHandlerInput = {
  defaultKnownIdeId: string | null;
  defaultTranscriptionProfileId: string | null;
  defaultSpeechProfileId: string | null;
  assistantAgentRegistryId: string | null;
  assistantAgentId: string | null;
  assistantCommandKVoiceModeEnabled: boolean;
  chatConversationFoldingEnabled: boolean;
  documentRunnerAgentRegistryId: string | null;
  // `undefined` preserves the existing value so callers that predate data-sync
  // need not set it; an explicit value (including `null`) writes through.
  syncDirectory?: string | null;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function appSettingsUpdateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.appSettingsTable)
      .where(eq(ctx.schema.appSettingsTable.id, 'singleton'))
      .get();

    if (existing === undefined) {
      const inserted = await ctx.database
        .insert(ctx.schema.appSettingsTable)
        .values({
          id: 'singleton',
          defaultKnownIdeId: input.defaultKnownIdeId,
          defaultTranscriptionProfileId: input.defaultTranscriptionProfileId,
          defaultSpeechProfileId: input.defaultSpeechProfileId,
          assistantAgentRegistryId: input.assistantAgentRegistryId,
          assistantAgentId: input.assistantAgentId,
          assistantCommandKVoiceModeEnabled: input.assistantCommandKVoiceModeEnabled,
          chatConversationFoldingEnabled: input.chatConversationFoldingEnabled,
          documentRunnerAgentRegistryId: input.documentRunnerAgentRegistryId,
          syncDirectory: input.syncDirectory ?? null,
        })
        .returning()
        .get();
      return inserted as AppSettingsRecord;
    }

    const updated = await ctx.database
      .update(ctx.schema.appSettingsTable)
      .set({
        defaultKnownIdeId: input.defaultKnownIdeId,
        defaultTranscriptionProfileId: input.defaultTranscriptionProfileId,
        defaultSpeechProfileId: input.defaultSpeechProfileId,
        assistantAgentRegistryId: input.assistantAgentRegistryId,
        assistantAgentId: input.assistantAgentId,
        assistantCommandKVoiceModeEnabled: input.assistantCommandKVoiceModeEnabled,
        chatConversationFoldingEnabled: input.chatConversationFoldingEnabled,
        documentRunnerAgentRegistryId: input.documentRunnerAgentRegistryId,
        syncDirectory: input.syncDirectory === undefined ? existing.syncDirectory : input.syncDirectory,
      })
      .where(eq(ctx.schema.appSettingsTable.id, 'singleton'))
      .returning()
      .get();
    return updated as AppSettingsRecord;
  };
}
