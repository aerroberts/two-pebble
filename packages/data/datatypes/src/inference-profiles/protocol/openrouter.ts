export interface InferenceProfile_OpenRouter_Intelligence {
  provider: 'openrouter';
  kind: 'intelligence';
  integrationId: string;
  data: {
    model: string;
  };
}

export interface InferenceProfile_OpenRouter_Transcription {
  provider: 'openrouter';
  kind: 'transcription';
  integrationId: string;
  data: {
    model: string;
  };
}

export interface InferenceProfile_OpenRouter_Speech {
  provider: 'openrouter';
  kind: 'speech';
  integrationId: string;
  data: {
    model: string;
    voice: string;
    format?: string;
  };
}

export type InferenceProfile_OpenRouter =
  | InferenceProfile_OpenRouter_Intelligence
  | InferenceProfile_OpenRouter_Transcription
  | InferenceProfile_OpenRouter_Speech;
