import type { AppSettings } from '@two-pebble/datatypes';

type AppSettingsRecord = AppSettings & {
  id: string;
  createdAt: number;
  updatedAt: number;
};

export interface AppSettingsReadOperation {
  name: 'readAppSettings';
  request: object;
  response: AppSettingsRecord;
}
