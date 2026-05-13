export interface InferenceProfile_OpenAi_Intelligence {
  provider: 'openai';
  kind: 'intelligence';
  integrationId: string;
  data: {
    model: string;
  };
}

export interface InferenceProfile_OpenAi_Transcription {
  provider: 'openai';
  kind: 'transcription';
  integrationId: string;
  data: {
    model: string;
  };
}

export interface InferenceProfile_OpenAi_Speech {
  provider: 'openai';
  kind: 'speech';
  integrationId: string;
  data: {
    model: string;
    voice: string;
    format?: string;
  };
}

export type InferenceProfile_OpenAi =
  | InferenceProfile_OpenAi_Intelligence
  | InferenceProfile_OpenAi_Transcription
  | InferenceProfile_OpenAi_Speech;
