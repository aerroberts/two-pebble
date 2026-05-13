import type { LoadableRegistry } from '../../loadable';
import type { RealtimeEmitPayload, RealtimeEmitResponse } from '../../types';

export interface IntegrationsState {
  integrations: LoadableRegistry<IntegrationRecord>;
}

export type CreateIntegrationInput = RealtimeEmitPayload<'createIntegration'>;
export type UpdateIntegrationInput = RealtimeEmitPayload<'updateIntegration'>;
export type IntegrationRecord = RealtimeEmitResponse<'listIntegrations'>['items'][number];
export type IntegrationData = IntegrationRecord['data'];
export type IntegrationProvider = IntegrationRecord['provider'];
