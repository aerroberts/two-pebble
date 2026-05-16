import { eq } from 'drizzle-orm';
import { APP_SETTINGS_SINGLETON_ID } from '../schema/app-settings.table';
import type { AppSettingsRecord, DatastoreContext } from '../types';

type OperationHandlerInput = {
  readonly __noInput?: never;
};

export function appSettingsReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    void input;
    const row = await ctx.database
      .select()
      .from(ctx.schema.appSettingsTable)
      .where(eq(ctx.schema.appSettingsTable.id, APP_SETTINGS_SINGLETON_ID))
      .get();

    if (row !== undefined) {
      return row as AppSettingsRecord;
    }

    const now = Date.now();
    const fallback: AppSettingsRecord = {
      id: APP_SETTINGS_SINGLETON_ID,
      createdAt: now,
      updatedAt: now,
      defaultTranscriptionProfileId: null,
      defaultSpeechProfileId: null,
      assistantAgentRegistryId: null,
      assistantAgentId: null,
      assistantCommandKEnabled: false,
      assistantCommandKVoiceModeEnabled: false,
      assistantCommandKKeepOpenAfterSend: false,
    };
    return fallback;
  };
}
