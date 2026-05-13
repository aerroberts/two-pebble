import type { Loadable } from '../../loadable';
import type { RealtimeEmitPayload, RealtimeEmitResponse } from '../../types';

export type AppSettingsRecord = RealtimeEmitResponse<'readAppSettings'>;
export type UpdateAppSettingsInput = RealtimeEmitPayload<'updateAppSettings'>;

export interface AppSettingsState {
  appSettings: Loadable<AppSettingsRecord>;
}
