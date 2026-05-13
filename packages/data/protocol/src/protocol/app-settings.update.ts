import type { AppSettings } from '@two-pebble/datatypes';

type AppSettingsRecord = AppSettings & {
  id: string;
  createdAt: number;
  updatedAt: number;
};

export interface AppSettingsUpdateOperation {
  name: 'updateAppSettings';
  request: AppSettings;
  response: AppSettingsRecord;
}
