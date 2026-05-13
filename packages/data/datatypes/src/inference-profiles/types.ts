import type { InferenceProfile_Anthropic } from './protocol/anthropic';
import type { InferenceProfile_Ollama } from './protocol/ollama';
import type {
  InferenceProfile_OpenAi,
  InferenceProfile_OpenAi_Intelligence,
  InferenceProfile_OpenAi_Speech,
  InferenceProfile_OpenAi_Transcription,
} from './protocol/openai';
import type {
  InferenceProfile_OpenRouter,
  InferenceProfile_OpenRouter_Intelligence,
  InferenceProfile_OpenRouter_Speech,
  InferenceProfile_OpenRouter_Transcription,
} from './protocol/openrouter';

export type {
  InferenceProfile_Anthropic,
  InferenceProfile_Ollama,
  InferenceProfile_OpenAi,
  InferenceProfile_OpenAi_Intelligence,
  InferenceProfile_OpenAi_Speech,
  InferenceProfile_OpenAi_Transcription,
  InferenceProfile_OpenRouter,
  InferenceProfile_OpenRouter_Intelligence,
  InferenceProfile_OpenRouter_Speech,
  InferenceProfile_OpenRouter_Transcription,
};

export type InferenceProfile_Intelligence =
  | InferenceProfile_Anthropic
  | InferenceProfile_Ollama
  | InferenceProfile_OpenAi_Intelligence
  | InferenceProfile_OpenRouter_Intelligence;

export type InferenceProfile_Transcription =
  | InferenceProfile_OpenAi_Transcription
  | InferenceProfile_OpenRouter_Transcription;

export type InferenceProfile_Speech = InferenceProfile_OpenAi_Speech | InferenceProfile_OpenRouter_Speech;

export type InferenceProfile = InferenceProfile_Intelligence | InferenceProfile_Transcription | InferenceProfile_Speech;

export type InferenceProfileKind = InferenceProfile['kind'];
