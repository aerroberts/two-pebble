import type { ProviderException, TranscriptionInput, TranscriptionResult } from './types';
import { withRetries } from './utils/retry';

/**
 * Base class for speech-to-text provider adapters.
 * Providers own credentials, request mapping, transport, and response normalization.
 * Returns a TranscriptionResult that the agent layer can convert into a text cell.
 */
export abstract class TranscriptionProvider {
  public abstract readonly providerId: string;
  public abstract readonly modelId: string;

  /**
   * Transcribes a single audio clip to text, retrying retryable failures with
   * exponential backoff. Concrete providers implement `transcribeOnce`.
   */
  public async transcribe(input: TranscriptionInput, callId: string): Promise<TranscriptionResult> {
    const startedAt = Date.now();
    return withRetries<TranscriptionResult>(
      () => this.transcribeOnce(input, callId),
      (error) => this.exceptionToResult(error, callId, startedAt),
      { sleep: (ms) => this.sleep(ms) },
    );
  }

  /**
   * Transcribes once without retry orchestration. Retryable failures should
   * return a TranscriptionResult with status 'error' and retryable true;
   * thrown exceptions are converted to retryable error results by the base
   * class.
   */
  protected abstract transcribeOnce(input: TranscriptionInput, callId: string): Promise<TranscriptionResult>;

  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private exceptionToResult(error: ProviderException, callId: string, startedAt: number): TranscriptionResult {
    return {
      id: callId,
      startedAt,
      completedAt: Date.now(),
      modelId: this.modelId,
      provider: this.providerId,
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      retryable: true,
      text: '',
      prices: [],
      providerInput: {},
      providerOutput: {},
    };
  }
}
