import type { AppSettings } from '@two-pebble/datatypes';

type AppSettingsRecord = AppSettings & {
  id: string;
  createdAt: number;
  updatedAt: number;
};

/**
 * Defines the AppSettingsReadOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AppSettingsReadOperation {
  name: 'readAppSettings';
  request: object;
  response: AppSettingsRecord;
}
