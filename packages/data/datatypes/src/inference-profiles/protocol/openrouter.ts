/**
 * OpenRouter intelligence profile settings.
 * These profiles route text-oriented inference through the linked OpenRouter
 * integration using the configured model.
 */
export interface InferenceProfile_OpenRouter_Intelligence {
  provider: 'openrouter';
  kind: 'intelligence';
  integrationId: string;
  data: {
    model: string;
  };
}

/**
 * OpenRouter transcription profile settings.
 * The model field identifies the speech-to-text route used with the linked
 * OpenRouter integration.
 */
export interface InferenceProfile_OpenRouter_Transcription {
  provider: 'openrouter';
  kind: 'transcription';
  integrationId: string;
  data: {
    model: string;
  };
}

/**
 * OpenRouter speech profile settings.
 * Speech profiles carry the text-to-speech model, voice, and optional output
 * format used when generating audio through OpenRouter.
 */
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

/**
 * Union of all OpenRouter-backed inference profile variants.
 * Consumers can switch on `kind` after narrowing provider to `openrouter`.
 */
export type InferenceProfile_OpenRouter =
  | InferenceProfile_OpenRouter_Intelligence
  | InferenceProfile_OpenRouter_Transcription
  | InferenceProfile_OpenRouter_Speech;
