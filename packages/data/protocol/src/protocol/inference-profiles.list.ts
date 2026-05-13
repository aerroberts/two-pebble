import type { InferenceProfile } from '@two-pebble/datatypes';

type InferenceProfileRecord = InferenceProfile & {
  createdAt: number;
  id: string;
  name: string;
  updatedAt: number;
};

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
