import { SpeechProvider } from '../../speech-provider';
import type { SpeechInput, SpeechResult } from '../../types';
import { bytesToBase64 } from '../../utils/binary';
import { isRetryableProviderStatus } from '../../utils/retry';
import { buildOpenAISpeechPriceLineItems } from './pricing';
import type { OpenAISpeechProviderOptions, OpenAISpeechRequest } from './types';

/**
 * OpenAI text-to-speech provider for /v1/audio/speech.
 * Sends a JSON request and reads the response as raw audio bytes that get
 * normalized to a base64 SpeechResult.
 */
export class OpenAISpeechProvider extends SpeechProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly organization: string | undefined;
  private readonly defaultVoice: string;
  private readonly defaultFormat: string;
  public readonly modelId: string;
  public readonly providerId = 'openai';

  public constructor(options: OpenAISpeechProviderOptions) {
    super();
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? 'https://api.openai.com/v1';
    this.modelId = options.model;
    this.organization = options.organization;
    this.defaultVoice = options.voice;
    this.defaultFormat = options.format ?? 'mp3';
  }

  /**
   * Calls /v1/audio/speech and returns the synthesized audio as base64.
   * The voice and format on the input override the provider defaults when set.
   */
  protected override async synthesizeOnce(input: SpeechInput, callId: string): Promise<SpeechResult> {
    const startedAt = Date.now();
    const format = input.format ?? this.defaultFormat;
    const voice = input.voice.length === 0 ? this.defaultVoice : input.voice;
    const request: OpenAISpeechRequest = {
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
        error: `OpenAI speech request failed with ${response.status}`,
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
      prices: buildOpenAISpeechPriceLineItems({ modelId: this.modelId, characters: input.text.length }),
      providerInput: request,
      providerOutput: { byteLength: buffer.byteLength },
    };
  }

  private buildHeaders(): Headers {
    const headers = new Headers();
    headers.set('authorization', `Bearer ${this.apiKey}`);
    headers.set('content-type', 'application/json');
    if (this.organization != null) {
      headers.set('openai-organization', this.organization);
    }
    return headers;
  }

  private mimeTypeForFormat(format: string): string {
    switch (format) {
      case 'wav':
        return 'audio/wav';
      case 'pcm':
        return 'audio/pcm';
      case 'opus':
        return 'audio/opus';
      case 'flac':
        return 'audio/flac';
      case 'aac':
        return 'audio/aac';
      default:
        return 'audio/mpeg';
    }
  }
}
