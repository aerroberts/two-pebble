import type { InferenceProfile } from '@two-pebble/datatypes';
import { text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * Inference profiles bind an integration to model-specific settings.
 * They are the daemon-facing profile that can be turned into a Pebble provider.
 * The `provider` is no longer stored here — it's derived from the joined
 * integration on read so the schema doesn't keep a denormalized copy.
 */
export const inferenceProfilesTable = customTable('inference_profiles', {
  // The integration which owns credentials or connection details
  integrationId: text('integration_id').notNull(),

  // The capability this profile exposes: intelligence | transcription | speech.
  // Existing rows default to 'intelligence' since that was the only kind.
  kind: text('kind').notNull().default('intelligence').$type<InferenceProfile['kind']>(),

  // The user-facing name for this inference profile
  name: text('name').notNull(),

  // Per-model settings for this provider
  data: text('data', { mode: 'json' }).notNull().$type<InferenceProfile['data']>(),
});
