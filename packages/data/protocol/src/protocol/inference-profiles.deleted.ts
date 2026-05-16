/**
 * Defines the InferenceProfilesDeletedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface InferenceProfilesDeletedEvent {
  name: 'inferenceProfileDeleted';
  payload: {
    id: string;
  };
}
