import { TranscriptionProvider } from '../../transcription-provider';
import type { TranscriptionInput, TranscriptionResult } from '../../types';
import { isRetryableProviderStatus } from '../../utils/retry';
import { buildOpenRouterTranscriptionPriceLineItems } from './pricing';
import type {
  OpenRouterTranscriptionProviderOptions,
  OpenRouterTranscriptionRequest,
  OpenRouterTranscriptionResponse,
} from './types';

/**
 * OpenRouter speech-to-text provider for /api/v1/audio/transcriptions.
 * OpenRouter accepts JSON with base64 audio (not multipart), routing to
 * upstream providers like OpenAI Whisper, Groq Whisper, or Google Chirp.
 */
export class OpenRouterTranscriptionProvider extends TranscriptionProvider {
  private readonly apiKey: string;
  private readonly appName: string | undefined;
  private readonly baseUrl: string;
  private readonly siteUrl: string | undefined;
  public readonly modelId: string;
  public readonly providerId = 'openrouter';

  public constructor(options: OpenRouterTranscriptionProviderOptions) {
    super();
    this.apiKey = options.apiKey;
    this.appName = options.appName;
    this.baseUrl = options.baseUrl ?? 'https://openrouter.ai/api/v1';
    this.modelId = options.model;
    this.siteUrl = options.siteUrl;
  }

  /**
   * Calls /api/v1/audio/transcriptions with a single audio clip.
   * The 60-second upstream timeout is documented; long clips should be
   * chunked by the caller before reaching this provider.
   */
  protected override async transcribeOnce(input: TranscriptionInput, callId: string): Promise<TranscriptionResult> {
    const startedAt = Date.now();
    const request: OpenRouterTranscriptionRequest = {
      model: this.modelId,
      input_audio: { data: input.base64Data, format: this.audioFormatFor(input.mimeType) },
    };

    const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
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
        error: `OpenRouter transcription request failed with ${response.status}`,
        retryable: isRetryableProviderStatus(response.status),
        text: '',
        prices: [],
        providerInput: { ...request, input_audio: { ...request.input_audio, data: '<redacted>' } },
        providerOutput: { body: await response.text(), status: response.status },
      };
    }

    const data = (await response.json()) as OpenRouterTranscriptionResponse;
    return {
      id: callId,
      completedAt: Date.now(),
      modelId: this.modelId,
      provider: this.providerId,
      startedAt,
      status: 'success',
      text: data.text ?? '',
      ...(data.usage?.seconds === undefined ? {} : { durationMs: Math.round(data.usage.seconds * 1000) }),
      prices: buildOpenRouterTranscriptionPriceLineItems({ data, modelId: this.modelId }),
      providerInput: { ...request, input_audio: { ...request.input_audio, data: '<redacted>' } },
      providerOutput: data,
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

  private audioFormatFor(mimeType: string): string {
    const normalized = mimeType.toLowerCase();
    if (normalized.includes('wav')) return 'wav';
    if (normalized.includes('mp3') || normalized.includes('mpeg')) return 'mp3';
    if (normalized.includes('flac')) return 'flac';
    if (normalized.includes('ogg')) return 'ogg';
    if (normalized.includes('webm')) return 'webm';
    if (normalized.includes('m4a') || normalized.includes('mp4')) return 'm4a';
    if (normalized.includes('aiff')) return 'aiff';
    if (normalized.includes('aac')) return 'aac';
    if (normalized.includes('pcm16')) return 'pcm16';
    if (normalized.includes('pcm24')) return 'pcm24';
    return 'wav';
  }
}
