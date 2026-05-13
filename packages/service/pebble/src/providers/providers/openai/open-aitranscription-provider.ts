import { TranscriptionProvider } from '../../transcription-provider';
import type { TranscriptionInput, TranscriptionResult } from '../../types';
import { base64ToBytes } from '../../utils/binary';
import { isRetryableProviderStatus } from '../../utils/retry';
import { buildOpenAITranscriptionPriceLineItems } from './pricing';
import type { OpenAITranscriptionProviderOptions, OpenAITranscriptionResponse } from './types';

/**
 * OpenAI speech-to-text provider for /v1/audio/transcriptions.
 * Sends audio as multipart/form-data and parses the response into a
 * TranscriptionResult that the agent layer can convert into a text cell.
 */
export class OpenAITranscriptionProvider extends TranscriptionProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly organization: string | undefined;
  public readonly modelId: string;
  public readonly providerId = 'openai';

  public constructor(options: OpenAITranscriptionProviderOptions) {
    super();
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? 'https://api.openai.com/v1';
    this.modelId = options.model;
    this.organization = options.organization;
  }

  /**
   * Calls /v1/audio/transcriptions with a single audio clip.
   * Returns the transcribed text plus pricing line items.
   */
  protected override async transcribeOnce(input: TranscriptionInput, callId: string): Promise<TranscriptionResult> {
    const startedAt = Date.now();
    const form = this.buildForm(input);
    const requestSnapshot = { model: this.modelId, mimeType: input.mimeType };

    const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: form,
    });

    if (!response.ok) {
      return {
        id: callId,
        completedAt: Date.now(),
        modelId: this.modelId,
        provider: this.providerId,
        startedAt,
        status: 'error',
        error: `OpenAI transcription request failed with ${response.status}`,
        retryable: isRetryableProviderStatus(response.status),
        text: '',
        prices: [],
        providerInput: requestSnapshot,
        providerOutput: { body: await response.text(), status: response.status },
      };
    }

    const data = (await response.json()) as OpenAITranscriptionResponse;
    return {
      id: callId,
      completedAt: Date.now(),
      modelId: this.modelId,
      provider: this.providerId,
      startedAt,
      status: 'success',
      text: data.text ?? '',
      ...(data.language === undefined ? {} : { language: data.language }),
      ...(data.duration === undefined ? {} : { durationMs: Math.round(data.duration * 1000) }),
      prices: buildOpenAITranscriptionPriceLineItems({ data, modelId: this.modelId }),
      providerInput: requestSnapshot,
      providerOutput: data,
    };
  }

  private buildForm(input: TranscriptionInput): FormData {
    const form = new FormData();
    form.set('model', this.modelId);
    form.set('response_format', 'verbose_json');
    const filename = this.filenameForMimeType(input.mimeType);
    const bytes = base64ToBytes(input.base64Data);
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    const blob = new Blob([buffer], { type: input.mimeType });
    form.set('file', blob, filename);
    return form;
  }

  private buildHeaders(): Headers {
    const headers = new Headers();
    headers.set('authorization', `Bearer ${this.apiKey}`);
    if (this.organization != null) {
      headers.set('openai-organization', this.organization);
    }
    return headers;
  }

  private filenameForMimeType(mimeType: string): string {
    const normalized = mimeType.toLowerCase();
    if (normalized.includes('wav')) {
      return 'audio.wav';
    }
    if (normalized.includes('mp3') || normalized.includes('mpeg')) {
      return 'audio.mp3';
    }
    if (normalized.includes('ogg')) {
      return 'audio.ogg';
    }
    if (normalized.includes('webm')) {
      return 'audio.webm';
    }
    if (normalized.includes('flac')) {
      return 'audio.flac';
    }
    if (normalized.includes('m4a') || normalized.includes('mp4')) {
      return 'audio.m4a';
    }
    return 'audio.bin';
  }
}
