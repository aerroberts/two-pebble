import { eq } from 'drizzle-orm';
import type { AppSettingsRecord, DatastoreContext } from '../types';

type OperationHandlerInput = {
  readonly __noInput?: never;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function appSettingsReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    void input;
    const row = await ctx.database
      .select()
      .from(ctx.schema.appSettingsTable)
      .where(eq(ctx.schema.appSettingsTable.id, 'singleton'))
      .get();

    if (row !== undefined) {
      return row as AppSettingsRecord;
    }

    const now = Date.now();
    const fallback: AppSettingsRecord = {
      id: 'singleton',
      createdAt: now,
      updatedAt: now,
      defaultKnownIdeId: null,
      defaultTranscriptionProfileId: null,
      defaultSpeechProfileId: null,
      assistantAgentRegistryId: null,
      assistantAgentId: null,
      assistantCommandKVoiceModeEnabled: false,
      chatConversationFoldingEnabled: false,
      documentRunnerAgentRegistryId: null,
    };
    return fallback;
  };
}
