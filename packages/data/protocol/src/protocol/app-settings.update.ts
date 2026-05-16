import type { AppSettings } from '@two-pebble/datatypes';

type AppSettingsRecord = AppSettings & {
  id: string;
  createdAt: number;
  updatedAt: number;
};

/**
 * Defines the AppSettingsUpdateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AppSettingsUpdateOperation {
  name: 'updateAppSettings';
  request: AppSettings;
  response: AppSettingsRecord;
}
