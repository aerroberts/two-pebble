export interface InferenceProfilesDeletedEvent {
  name: 'inferenceProfileDeleted';
  payload: {
    id: string;
  };
}
