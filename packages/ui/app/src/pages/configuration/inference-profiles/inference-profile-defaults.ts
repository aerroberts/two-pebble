import type {
  CreateInferenceProfileInput,
  InferenceProfileKind,
  InferenceProfileRecord,
  IntegrationProvider,
  IntegrationRecord,
} from '@two-pebble/realtime';

export const INFERENCE_PROFILE_KINDS: InferenceProfileKind[] = ['intelligence', 'transcription', 'speech'];

const SUPPORTED_KINDS_BY_PROVIDER: Record<IntegrationProvider, InferenceProfileKind[]> = {
  anthropic: ['intelligence'],
  ollama: ['intelligence'],
  openai: ['intelligence', 'transcription', 'speech'],
  openrouter: ['intelligence', 'transcription', 'speech'],
};

export function providerSupportsKind(provider: IntegrationProvider, kind: InferenceProfileKind): boolean {
  return SUPPORTED_KINDS_BY_PROVIDER[provider].includes(kind);
}

export function getInferenceProfileKindLabel(kind: InferenceProfileKind): string {
  switch (kind) {
    case 'intelligence':
      return 'Intelligence';
    case 'transcription':
      return 'Transcription';
    case 'speech':
      return 'Speech';
  }
}

export function getInferenceProfileKindSubtitle(kind: InferenceProfileKind): string {
  switch (kind) {
    case 'intelligence':
      return 'Chat models for agents and conversations.';
    case 'transcription':
      return 'Speech-to-text models for audio input.';
    case 'speech':
      return 'Text-to-speech models for audio output.';
  }
}

export function getDefaultInferenceProfileInput(
  integration: IntegrationRecord,
  kind: InferenceProfileKind,
): CreateInferenceProfileInput | undefined {
  if (!providerSupportsKind(integration.provider, kind)) {
    return undefined;
  }

  const integrationId = integration.id;
  const name = getDefaultInferenceProfileName(integration.provider, kind);

  if (kind === 'intelligence') {
    return getDefaultIntelligenceInput(integration.provider, integrationId, name);
  }
  if (kind === 'transcription') {
    return getDefaultTranscriptionInput(integration.provider, integrationId, name);
  }
  return getDefaultSpeechInput(integration.provider, integrationId, name);
}

export function getDefaultInferenceProfileName(provider: IntegrationProvider, kind: InferenceProfileKind): string {
  if (kind === 'intelligence') {
    return getDefaultIntelligenceName(provider);
  }
  if (kind === 'transcription') {
    return getDefaultTranscriptionName(provider);
  }
  return getDefaultSpeechName(provider);
}

export function getInferenceProfileModel(profile: InferenceProfileRecord) {
  return profile.data.model;
}

function getDefaultIntelligenceInput(
  provider: IntegrationProvider,
  integrationId: string,
  name: string,
): CreateInferenceProfileInput | undefined {
  switch (provider) {
    case 'anthropic':
      return {
        data: { model: 'claude-sonnet-4-5', thinkingBudget: 4096 },
        integrationId,
        kind: 'intelligence',
        name,
        provider,
      };
    case 'ollama':
      return { data: { model: 'llama3.2' }, integrationId, kind: 'intelligence', name, provider };
    case 'openai':
    case 'openrouter':
      return { data: { model: 'gpt-5.4-mini' }, integrationId, kind: 'intelligence', name, provider };
  }
}

function getDefaultTranscriptionInput(
  provider: IntegrationProvider,
  integrationId: string,
  name: string,
): CreateInferenceProfileInput | undefined {
  switch (provider) {
    case 'openai':
      return { data: { model: 'gpt-4o-transcribe' }, integrationId, kind: 'transcription', name, provider };
    case 'openrouter':
      return { data: { model: 'openai/gpt-4o-transcribe' }, integrationId, kind: 'transcription', name, provider };
    case 'anthropic':
    case 'ollama':
      return undefined;
  }
}

function getDefaultSpeechInput(
  provider: IntegrationProvider,
  integrationId: string,
  name: string,
): CreateInferenceProfileInput | undefined {
  switch (provider) {
    case 'openai':
      return {
        data: { model: 'gpt-4o-mini-tts', voice: 'alloy', format: 'mp3' },
        integrationId,
        kind: 'speech',
        name,
        provider,
      };
    case 'openrouter':
      return {
        data: { model: 'openai/gpt-4o-mini-tts', voice: 'alloy', format: 'mp3' },
        integrationId,
        kind: 'speech',
        name,
        provider,
      };
    case 'anthropic':
    case 'ollama':
      return undefined;
  }
}

function getDefaultIntelligenceName(provider: IntegrationProvider): string {
  switch (provider) {
    case 'anthropic':
      return 'Claude Sonnet';
    case 'ollama':
      return 'Local Llama';
    case 'openai':
      return 'GPT Mini';
    case 'openrouter':
      return 'OpenRouter GPT Mini';
  }
}

function getDefaultTranscriptionName(provider: IntegrationProvider): string {
  switch (provider) {
    case 'openai':
      return 'OpenAI Transcribe';
    case 'openrouter':
      return 'OpenRouter Transcribe';
    case 'anthropic':
    case 'ollama':
      return '';
  }
}

function getDefaultSpeechName(provider: IntegrationProvider): string {
  switch (provider) {
    case 'openai':
      return 'OpenAI TTS';
    case 'openrouter':
      return 'OpenRouter TTS';
    case 'anthropic':
    case 'ollama':
      return '';
  }
}
