import type { InferenceProfileKind, IntegrationProvider } from '@two-pebble/realtime';

/**
 * Returns the curated list of known model IDs for a provider/kind pair.
 * Used by the inference profile settings page to surface a "Known model
 * IDs" dropdown next to the free-text input. Returns an empty array for
 * providers/kinds we don't curate (Ollama, OpenRouter).
 */
export function getKnownModelIds(provider: IntegrationProvider, kind: InferenceProfileKind): string[] {
  if (provider === 'anthropic') {
    return ANTHROPIC_KNOWN_MODELS[kind] ?? [];
  }
  if (provider === 'openai') {
    return OPENAI_KNOWN_MODELS[kind] ?? [];
  }
  if (provider === 'openrouter') {
    return OPENROUTER_KNOWN_MODELS[kind] ?? [];
  }
  return [];
}

const ANTHROPIC_KNOWN_MODELS: Record<InferenceProfileKind, string[]> = {
  intelligence: [
    'claude-opus-4-7',
    'claude-opus-4-6',
    'claude-opus-4-5',
    'claude-opus-4-1',
    'claude-sonnet-4-6',
    'claude-sonnet-4-5',
    'claude-haiku-4-5',
  ],
  transcription: [],
  speech: [],
};

const OPENROUTER_KNOWN_MODELS: Record<InferenceProfileKind, string[]> = {
  intelligence: [],
  transcription: [],
  speech: [
    'openai/gpt-4o-mini-tts-2025-12-15',
    'google/gemini-3.1-flash-tts-preview',
    'mistralai/voxtral-mini-tts-2603',
    'hexgrad/kokoro-82m',
    'canopylabs/orpheus-3b-0.1-ft',
    'sesame/csm-1b',
    'zyphra/zonos-v0.1-hybrid',
    'zyphra/zonos-v0.1-transformer',
  ],
};

const OPENAI_KNOWN_MODELS: Record<InferenceProfileKind, string[]> = {
  intelligence: [
    'gpt-5.5',
    'gpt-5.5-pro',
    'gpt-5.4',
    'gpt-5.4-pro',
    'gpt-5.4-mini',
    'gpt-5.4-nano',
    'gpt-5.2',
    'gpt-5.2-pro',
    'gpt-5.1',
    'gpt-5',
    'gpt-5-pro',
    'gpt-5-mini',
    'gpt-5-nano',
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4o',
    'gpt-4o-mini',
    'o3',
    'o3-pro',
  ],
  transcription: [
    'gpt-realtime-whisper',
    'gpt-4o-transcribe',
    'gpt-4o-mini-transcribe',
    'gpt-4o-transcribe-diarize',
    'whisper-1',
  ],
  speech: ['gpt-4o-mini-tts', 'tts-1', 'tts-1-hd'],
};
