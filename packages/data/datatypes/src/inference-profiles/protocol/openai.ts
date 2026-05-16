/**
 * OpenAI intelligence profile settings.
 * These profiles use a chat or reasoning model through the linked OpenAI
 * integration and produce text-oriented responses.
 */
export interface InferenceProfile_OpenAi_Intelligence {
  provider: 'openai';
  kind: 'intelligence';
  integrationId: string;
  data: {
    model: string;
  };
}

/**
 * OpenAI transcription profile settings.
 * The model field identifies the speech-to-text model used with the linked
 * OpenAI integration.
 */
export interface InferenceProfile_OpenAi_Transcription {
  provider: 'openai';
  kind: 'transcription';
  integrationId: string;
  data: {
    model: string;
  };
}

/**
 * OpenAI speech profile settings.
 * Speech profiles carry the text-to-speech model, voice, and optional output
 * format used when generating audio through OpenAI.
 */
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

/**
 * Union of all OpenAI-backed inference profile variants.
 * Consumers can switch on `kind` after narrowing provider to `openai`.
 */
export type InferenceProfile_OpenAi =
  | InferenceProfile_OpenAi_Intelligence
  | InferenceProfile_OpenAi_Transcription
  | InferenceProfile_OpenAi_Speech;
