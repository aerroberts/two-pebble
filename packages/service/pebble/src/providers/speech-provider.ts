import type { SpeechInput, SpeechResult } from './types';
import { withRetries } from './utils/retry';

/**
 * Base class for text-to-speech provider adapters.
 * Providers own credentials, request mapping, transport, and response normalization.
 * Returns a SpeechResult containing base64-encoded audio bytes.
 */
export abstract class SpeechProvider {
  public abstract readonly providerId: string;
  public abstract readonly modelId: string;

  /**
   * Synthesizes a single text utterance to audio, retrying retryable failures
   * with exponential backoff. Concrete providers implement `synthesizeOnce`.
   */
  public async synthesize(input: SpeechInput, callId: string): Promise<SpeechResult> {
    const startedAt = Date.now();
    return withRetries<SpeechResult>(
      () => this.synthesizeOnce(input, callId),
      (error) => this.exceptionToResult(error, callId, startedAt),
      { sleep: (ms) => this.sleep(ms) },
    );
  }

  /**
   * Synthesizes once without retry orchestration. Retryable failures should
   * return a SpeechResult with status 'error' and retryable true; thrown
   * exceptions are converted to retryable error results by the base class.
   */
  protected abstract synthesizeOnce(input: SpeechInput, callId: string): Promise<SpeechResult>;

  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private exceptionToResult(error: unknown, callId: string, startedAt: number): SpeechResult {
    return {
      id: callId,
      startedAt,
      completedAt: Date.now(),
      modelId: this.modelId,
      provider: this.providerId,
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      retryable: true,
      base64Data: '',
      mimeType: 'application/octet-stream',
      prices: [],
      providerInput: {},
      providerOutput: {},
    };
  }
}
