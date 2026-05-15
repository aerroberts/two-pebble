import type { LoadableRegistry } from '../../loadable';
import type { RealtimeEmitPayload, RealtimeEmitResponse } from '../../types';

export interface AutomationsState {
  automations: LoadableRegistry<AutomationRecord>;
  heartbeats: LoadableRegistry<HeartbeatRecord>;
}

export type AutomationRecord = RealtimeEmitResponse<'listAutomations'>['items'][number];
export type AutomationIntervalUnit = AutomationRecord['intervalUnit'];
export type CreateAutomationInput = RealtimeEmitPayload<'createAutomation'>;
export type UpdateAutomationInput = RealtimeEmitPayload<'updateAutomation'>;
export type DeleteAutomationInput = RealtimeEmitPayload<'deleteAutomation'>;
export type RunAutomationNowInput = RealtimeEmitPayload<'runAutomationNow'>;
export type HeartbeatRecord = RealtimeEmitResponse<'listHeartbeats'>['items'][number];
export type HeartbeatReport = HeartbeatRecord['reports'][number];
