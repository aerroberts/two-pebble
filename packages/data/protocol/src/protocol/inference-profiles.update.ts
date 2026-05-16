import type { InferenceProfile } from '@two-pebble/datatypes';

type InferenceProfileUpdateInput = InferenceProfile & {
  id: string;
  name: string;
};

/**
 * Defines the InferenceProfilesUpdateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface InferenceProfilesUpdateOperation {
  name: 'updateInferenceProfile';
  request: InferenceProfileUpdateInput;
  response: {
    id: string;
  };
}
