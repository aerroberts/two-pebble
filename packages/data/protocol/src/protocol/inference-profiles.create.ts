import type { InferenceProfile } from '@two-pebble/datatypes';

type InferenceProfileCreateInput = InferenceProfile & {
  name: string;
};

export interface InferenceProfilesCreateOperation {
  name: 'createInferenceProfile';
  request: InferenceProfileCreateInput;
  response: {
    id: string;
  };
}
