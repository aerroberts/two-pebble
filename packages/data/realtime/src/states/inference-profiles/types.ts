import type { LoadableRegistry } from '../../loadable';
import type { RealtimeEmitPayload, RealtimeEmitResponse } from '../../types';

export interface InferenceProfilesState {
  inferenceProfiles: LoadableRegistry<InferenceProfileRecord>;
}

export type CreateInferenceProfileInput = RealtimeEmitPayload<'createInferenceProfile'>;
export type UpdateInferenceProfileInput = RealtimeEmitPayload<'updateInferenceProfile'>;
export type InferenceProfileRecord = RealtimeEmitResponse<'listInferenceProfiles'>['items'][number];
export type InferenceProfileData = InferenceProfileRecord['data'];
export type InferenceProfileProvider = InferenceProfileRecord['provider'];
export type InferenceProfileKind = InferenceProfileRecord['kind'];
