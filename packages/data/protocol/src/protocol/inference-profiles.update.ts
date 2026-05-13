import type { InferenceProfile } from '@two-pebble/datatypes';

type InferenceProfileUpdateInput = InferenceProfile & {
  id: string;
  name: string;
};

export interface InferenceProfilesUpdateOperation {
  name: 'updateInferenceProfile';
  request: InferenceProfileUpdateInput;
  response: {
    id: string;
  };
}
