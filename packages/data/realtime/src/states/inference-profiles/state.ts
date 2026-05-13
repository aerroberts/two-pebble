import { LoadableRegistry } from '../../loadable';
import type { InferenceProfileRecord, InferenceProfilesState } from './types';

export function createInferenceProfilesState(): InferenceProfilesState {
  return {
    inferenceProfiles: new LoadableRegistry<InferenceProfileRecord>(),
  };
}
