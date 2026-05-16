import type { InferenceProfile } from '@two-pebble/datatypes';

type InferenceProfileRecord = InferenceProfile & {
  createdAt: number;
  id: string;
  name: string;
  updatedAt: number;
};

/**
 * Defines the InferenceProfilesListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface InferenceProfilesListOperation {
  name: 'listInferenceProfiles';
  request: {
    limit: number;
    offset: number;
  };
  response: {
    items: InferenceProfileRecord[];
    page: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}
