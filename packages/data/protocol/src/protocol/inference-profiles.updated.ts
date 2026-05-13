import type { InferenceProfile } from '@two-pebble/datatypes';

type InferenceProfileRecord = InferenceProfile & {
  createdAt: number;
  id: string;
  name: string;
  updatedAt: number;
};

export interface InferenceProfilesUpdatedEvent {
  name: 'inferenceProfileUpdated';
  payload: InferenceProfileRecord;
}
