import { eq } from 'drizzle-orm';
import type { AppSettingsRecord, DatastoreContext } from '../types';

type OperationHandlerInput = {
  defaultTranscriptionProfileId: string | null;
  defaultSpeechProfileId: string | null;
  assistantAgentRegistryId: string | null;
  assistantAgentId: string | null;
  assistantCommandKEnabled: boolean;
  assistantCommandKVoiceModeEnabled: boolean;
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
          defaultTranscriptionProfileId: input.defaultTranscriptionProfileId,
          defaultSpeechProfileId: input.defaultSpeechProfileId,
          assistantAgentRegistryId: input.assistantAgentRegistryId,
          assistantAgentId: input.assistantAgentId,
          assistantCommandKEnabled: input.assistantCommandKEnabled,
          assistantCommandKVoiceModeEnabled: input.assistantCommandKVoiceModeEnabled,
        })
        .returning()
        .get();
      return inserted as AppSettingsRecord;
    }

    const updated = await ctx.database
      .update(ctx.schema.appSettingsTable)
      .set({
        defaultTranscriptionProfileId: input.defaultTranscriptionProfileId,
        defaultSpeechProfileId: input.defaultSpeechProfileId,
        assistantAgentRegistryId: input.assistantAgentRegistryId,
        assistantAgentId: input.assistantAgentId,
        assistantCommandKEnabled: input.assistantCommandKEnabled,
        assistantCommandKVoiceModeEnabled: input.assistantCommandKVoiceModeEnabled,
      })
      .where(eq(ctx.schema.appSettingsTable.id, 'singleton'))
      .returning()
      .get();
    return updated as AppSettingsRecord;
  };
}
