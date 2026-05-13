import type {
  InferenceProfile,
  InferenceProfile_Anthropic,
  InferenceProfile_Ollama,
  InferenceProfile_OpenAi_Intelligence,
  InferenceProfile_OpenAi_Speech,
  InferenceProfile_OpenAi_Transcription,
  InferenceProfile_OpenRouter_Intelligence,
  InferenceProfile_OpenRouter_Speech,
  InferenceProfile_OpenRouter_Transcription,
  Integration,
  Integration_Anthropic,
  Integration_Ollama,
  Integration_OpenAi,
  Integration_OpenRouter,
} from '@two-pebble/datatypes';
import type { ModelProvider } from './model-provider';
import { AnthropicProvider } from './providers/anthropic/index';
import { OllamaProvider } from './providers/ollama/index';
import { OpenAIProvider, OpenAISpeechProvider, OpenAITranscriptionProvider } from './providers/openai/index';
import {
  OpenRouterProvider,
  OpenRouterSpeechProvider,
  OpenRouterTranscriptionProvider,
} from './providers/openrouter/index';
import type { SpeechProvider } from './speech-provider';
import type { TranscriptionProvider } from './transcription-provider';

/**
 * Builds concrete provider adapters from datastore records.
 * Integration records own credentials and endpoints.
 * Inference profiles own model-specific runtime options and a kind discriminator
 * that picks between intelligence (chat), transcription (STT), and speech (TTS).
 */
export class ProviderFactory {
  /**
   * Selects the chat / intelligence provider implementation for matching records.
   * Provider mismatches and non-intelligence kinds are rejected instead of guessed.
   * The returned provider is ready for agent model calls.
   */
  public buildProvider(integration: Integration, inference: InferenceProfile): ModelProvider {
    if (inference.kind !== 'intelligence') {
      throw new Error(`buildProvider expects an intelligence profile, got: ${inference.kind}`);
    }

    if (integration.provider === 'anthropic' && inference.provider === 'anthropic') {
      return this.buildAnthropicProvider(integration, inference);
    }
    if (integration.provider === 'ollama' && inference.provider === 'ollama') {
      return this.buildOllamaProvider(integration, inference);
    }
    if (integration.provider === 'openai' && inference.provider === 'openai') {
      return this.buildOpenAIProvider(integration, inference);
    }
    if (integration.provider === 'openrouter' && inference.provider === 'openrouter') {
      return this.buildOpenRouterProvider(integration, inference);
    }
    throw new Error(`Unsupported provider: ${integration.provider} / ${inference.provider}`);
  }

  /**
   * Selects the transcription provider implementation for matching records.
   * Provider mismatches and non-transcription kinds are rejected.
   */
  public buildTranscriptionProvider(integration: Integration, inference: InferenceProfile): TranscriptionProvider {
    if (inference.kind !== 'transcription') {
      throw new Error(`buildTranscriptionProvider expects a transcription profile, got: ${inference.kind}`);
    }

    if (integration.provider === 'openai' && inference.provider === 'openai') {
      return this.buildOpenAITranscriptionProvider(integration, inference);
    }
    if (integration.provider === 'openrouter' && inference.provider === 'openrouter') {
      return this.buildOpenRouterTranscriptionProvider(integration, inference);
    }
    throw new Error(`Unsupported transcription provider: ${integration.provider} / ${inference.provider}`);
  }

  /**
   * Selects the speech provider implementation for matching records.
   * Provider mismatches and non-speech kinds are rejected.
   */
  public buildSpeechProvider(integration: Integration, inference: InferenceProfile): SpeechProvider {
    if (inference.kind !== 'speech') {
      throw new Error(`buildSpeechProvider expects a speech profile, got: ${inference.kind}`);
    }

    if (integration.provider === 'openai' && inference.provider === 'openai') {
      return this.buildOpenAISpeechProvider(integration, inference);
    }
    if (integration.provider === 'openrouter' && inference.provider === 'openrouter') {
      return this.buildOpenRouterSpeechProvider(integration, inference);
    }
    throw new Error(`Unsupported speech provider: ${integration.provider} / ${inference.provider}`);
  }

  private buildAnthropicProvider(integration: Integration_Anthropic, inference: InferenceProfile_Anthropic) {
    return new AnthropicProvider({
      apiKey: integration.data.apiKey,
      maxTokens: inference.data.thinkingBudget,
      model: inference.data.model,
    });
  }

  private buildOllamaProvider(integration: Integration_Ollama, inference: InferenceProfile_Ollama) {
    return new OllamaProvider({
      baseUrl: integration.data.baseUrl,
      model: inference.data.model,
    });
  }

  private buildOpenAIProvider(integration: Integration_OpenAi, inference: InferenceProfile_OpenAi_Intelligence) {
    return new OpenAIProvider({
      apiKey: integration.data.apiKey,
      model: inference.data.model,
    });
  }

  private buildOpenRouterProvider(
    integration: Integration_OpenRouter,
    inference: InferenceProfile_OpenRouter_Intelligence,
  ) {
    return new OpenRouterProvider({
      apiKey: integration.data.apiKey,
      model: inference.data.model,
    });
  }

  private buildOpenAITranscriptionProvider(
    integration: Integration_OpenAi,
    inference: InferenceProfile_OpenAi_Transcription,
  ) {
    return new OpenAITranscriptionProvider({
      apiKey: integration.data.apiKey,
      model: inference.data.model,
    });
  }

  private buildOpenRouterTranscriptionProvider(
    integration: Integration_OpenRouter,
    inference: InferenceProfile_OpenRouter_Transcription,
  ) {
    return new OpenRouterTranscriptionProvider({
      apiKey: integration.data.apiKey,
      model: inference.data.model,
    });
  }

  private buildOpenAISpeechProvider(integration: Integration_OpenAi, inference: InferenceProfile_OpenAi_Speech) {
    return new OpenAISpeechProvider({
      apiKey: integration.data.apiKey,
      model: inference.data.model,
      voice: inference.data.voice,
      ...(inference.data.format === undefined ? {} : { format: inference.data.format }),
    });
  }

  private buildOpenRouterSpeechProvider(
    integration: Integration_OpenRouter,
    inference: InferenceProfile_OpenRouter_Speech,
  ) {
    return new OpenRouterSpeechProvider({
      apiKey: integration.data.apiKey,
      model: inference.data.model,
      voice: inference.data.voice,
      ...(inference.data.format === undefined ? {} : { format: inference.data.format }),
    });
  }
}
