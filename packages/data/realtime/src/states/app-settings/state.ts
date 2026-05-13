import { Loadable } from '../../loadable';
import type { AppSettingsRecord, AppSettingsState } from './types';

export function createAppSettingsState(): AppSettingsState {
  return {
    appSettings: new Loadable<AppSettingsRecord>({ status: 'idle', value: null }),
  };
}
