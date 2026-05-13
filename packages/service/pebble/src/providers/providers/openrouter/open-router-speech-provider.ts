import { SpeechProvider } from '../../speech-provider';
import type { SpeechInput, SpeechResult } from '../../types';
import { bytesToBase64 } from '../../utils/binary';
import { isRetryableProviderStatus } from '../../utils/retry';
import { buildOpenRouterSpeechPriceLineItems } from './pricing';
import type { OpenRouterSpeechProviderOptions, OpenRouterSpeechRequest } from './types';

/**
 * OpenRouter text-to-speech provider for /api/v1/audio/speech.
 * Mirrors the OpenAI shape (JSON in, audio bytes out) and routes to upstream
 * TTS providers like OpenAI gpt-4o-mini-tts, Mistral Voxtral, or Gemini Flash TTS.
 */
export class OpenRouterSpeechProvider extends SpeechProvider {
  private readonly apiKey: string;
  private readonly appName: string | undefined;
  private readonly baseUrl: string;
  private readonly defaultVoice: string;
  private readonly defaultFormat: string;
  private readonly siteUrl: string | undefined;
  public readonly modelId: string;
  public readonly providerId = 'openrouter';

  public constructor(options: OpenRouterSpeechProviderOptions) {
    super();
    this.apiKey = options.apiKey;
    this.appName = options.appName;
    this.baseUrl = options.baseUrl ?? 'https://openrouter.ai/api/v1';
    this.defaultVoice = options.voice;
    this.defaultFormat = options.format ?? 'mp3';
    this.modelId = options.model;
    this.siteUrl = options.siteUrl;
  }

  /**
   * Calls /api/v1/audio/speech and returns synthesized audio as base64.
   * OpenRouter only supports mp3 and pcm response_format values.
   */
  protected override async synthesizeOnce(input: SpeechInput, callId: string): Promise<SpeechResult> {
    const startedAt = Date.now();
    const format = input.format ?? this.defaultFormat;
    const voice = input.voice.length === 0 ? this.defaultVoice : input.voice;
    const request: OpenRouterSpeechRequest = {
      model: this.modelId,
      input: input.text,
      voice,
      response_format: format,
    };

    const response = await fetch(`${this.baseUrl}/audio/speech`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      return {
        id: callId,
        completedAt: Date.now(),
        modelId: this.modelId,
        provider: this.providerId,
        startedAt,
        status: 'error',
        error: `OpenRouter speech request failed with ${response.status}`,
        retryable: isRetryableProviderStatus(response.status),
        base64Data: '',
        mimeType: this.mimeTypeForFormat(format),
        prices: [],
        providerInput: request,
        providerOutput: { body: await response.text(), status: response.status },
      };
    }

    const buffer = await response.arrayBuffer();
    const base64Data = bytesToBase64(new Uint8Array(buffer));
    return {
      id: callId,
      completedAt: Date.now(),
      modelId: this.modelId,
      provider: this.providerId,
      startedAt,
      status: 'success',
      base64Data,
      mimeType: this.mimeTypeForFormat(format),
      prices: buildOpenRouterSpeechPriceLineItems({ modelId: this.modelId, characters: input.text.length }),
      providerInput: request,
      providerOutput: { byteLength: buffer.byteLength },
    };
  }

  private buildHeaders(): Headers {
    const headers = new Headers();
    headers.set('authorization', `Bearer ${this.apiKey}`);
    headers.set('content-type', 'application/json');
    if (this.siteUrl != null) {
      headers.set('http-referer', this.siteUrl);
    }
    if (this.appName != null) {
      headers.set('x-title', this.appName);
    }
    return headers;
  }

  private mimeTypeForFormat(format: string): string {
    return format === 'pcm' ? 'audio/pcm' : 'audio/mpeg';
  }
}
