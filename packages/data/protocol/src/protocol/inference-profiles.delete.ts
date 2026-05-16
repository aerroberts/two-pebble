/**
 * Defines the InferenceProfilesDeleteOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface InferenceProfilesDeleteOperation {
  name: 'deleteInferenceProfile';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
