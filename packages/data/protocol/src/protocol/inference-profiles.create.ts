import type { InferenceProfile } from '@two-pebble/datatypes';

type InferenceProfileCreateInput = InferenceProfile & {
  name: string;
};

/**
 * Defines the InferenceProfilesCreateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface InferenceProfilesCreateOperation {
  name: 'createInferenceProfile';
  request: InferenceProfileCreateInput;
  response: {
    id: string;
  };
}
