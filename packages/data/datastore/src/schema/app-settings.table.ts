import { integer, text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * Singleton table for app-wide preferences. The daemon and UI reads/writes the
 * row keyed by `id = 'singleton'`; the row is created lazily on first update.
 */
export const appSettingsTable = customTable('app_settings', {
  // The default IDE used to open an agent workspace. Null means no default.
  defaultKnownIdeId: text('default_known_ide_id'),

  // The default transcription inference profile id used by voice capture flows.
  defaultTranscriptionProfileId: text('default_transcription_profile_id'),

  // The default speech (TTS) inference profile id used by speech output flows.
  defaultSpeechProfileId: text('default_speech_profile_id'),

  // Agent registry id that powers the Assistant feature.
  assistantAgentRegistryId: text('assistant_agent_registry_id'),

  // Current agent instance id that the Assistant page reuses across visits.
  assistantAgentId: text('assistant_agent_id'),

  // Toggle for the Command-K global shortcut that opens the assistant speech overlay.
  assistantCommandKEnabled: integer('assistant_command_k_enabled', { mode: 'boolean' }).notNull().default(false),

  // When the Command-K overlay opens, start the mic immediately instead of showing the
  // text-with-voice composer. Has no effect when the Command-K shortcut itself is disabled.
  assistantCommandKVoiceModeEnabled: integer('assistant_command_k_voice_mode_enabled', { mode: 'boolean' })
    .notNull()
    .default(false),

  // When true, the chat view defaults each user → assistant exchange to a folded
  // layout, hiding intermediate tool / model traces behind a click-to-expand
  // control. Purely a rendering preference — no traces are dropped.
  chatConversationFoldingEnabled: integer('chat_conversation_folding_enabled', { mode: 'boolean' })
    .notNull()
    .default(false),

  // Agent registry id used by the document "Send to Agent" affordance. `null` hides
  // the button on the document view.
  documentRunnerAgentRegistryId: text('document_runner_agent_registry_id'),

  // Local folder used by the data-sync feature for export/import of configuration
  // and documents. `null` means no directory has been chosen yet.
  syncDirectory: text('sync_directory'),
});
