import { eq } from 'drizzle-orm';
import { APP_SETTINGS_SINGLETON_ID } from '../schema/app-settings.table';
import type { AppSettingsRecord, DatastoreContext } from '../types';

type OperationHandlerInput = {
  defaultTranscriptionProfileId: string | null;
  defaultSpeechProfileId: string | null;
  assistantAgentRegistryId: string | null;
  assistantAgentId: string | null;
};

export function appSettingsUpdateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.appSettingsTable)
      .where(eq(ctx.schema.appSettingsTable.id, APP_SETTINGS_SINGLETON_ID))
      .get();

    if (existing === undefined) {
      const inserted = await ctx.database
        .insert(ctx.schema.appSettingsTable)
        .values({
          id: APP_SETTINGS_SINGLETON_ID,
          defaultTranscriptionProfileId: input.defaultTranscriptionProfileId,
          defaultSpeechProfileId: input.defaultSpeechProfileId,
          assistantAgentRegistryId: input.assistantAgentRegistryId,
          assistantAgentId: input.assistantAgentId,
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
      })
      .where(eq(ctx.schema.appSettingsTable.id, APP_SETTINGS_SINGLETON_ID))
      .returning()
      .get();
    return updated as AppSettingsRecord;
  };
}
