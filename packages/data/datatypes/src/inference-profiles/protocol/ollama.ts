export interface InferenceProfile_Ollama {
  provider: 'ollama';
  kind: 'intelligence';
  integrationId: string;
  data: {
    model: string;
  };
}
