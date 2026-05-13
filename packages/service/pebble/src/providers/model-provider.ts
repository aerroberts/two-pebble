import type { ConversationThread } from '../thread/index';
import type { ModelProviderExceptionInput, ProviderResult } from './types';
import { withRetries } from './utils/retry';

/**
 * Base class for model provider adapters.
 * Providers share thread serialization while owning transport details.
 */
export abstract class ModelProvider {
  public abstract readonly providerId: string;
  public abstract readonly modelId: string;
  /**
   * Whether the model accepts audio cells in conversation context.
   * Drives whether providers walk turn.cells to emit input_audio blocks
   * versus falling back to the rendered markdown placeholder.
   */
  public readonly supportsAudioMessages: boolean = false;

  /**
   * Invokes a provider with a conversation thread.
   * Concrete providers decide how serialized turns are transported.
   */
  public async invoke(thread: ConversationThread, modelCallId: string): Promise<ProviderResult> {
    const startedAt = Date.now();
    const result = await withRetries<ProviderResult>(
      () => this.invokeProvider(thread, modelCallId),
      (error) => this.exceptionToResult({ error, modelCallId, thread, startedAt }),
      { sleep: (ms) => this.sleep(ms) },
    );
    return this.finalizeResult(thread, result, modelCallId);
  }

  /**
   * Invokes the provider once without retry orchestration.
   * Concrete providers own transport and response normalization here.
   * Retryable failures should return ProviderResult with retryable true.
   * Thrown exceptions are converted to retryable error results by the base
   * class — transport failures (DNS, ECONNRESET, abort) are inherently
   * transient.
   */
  protected abstract invokeProvider(thread: ConversationThread, modelCallId: string): Promise<ProviderResult>;

  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private exceptionToResult(input: ModelProviderExceptionInput): ProviderResult {
    return {
      id: input.modelCallId,
      startedAt: input.startedAt,
      completedAt: Date.now(),
      modelId: this.modelId,
      provider: this.providerId,
      status: 'error',
      error: input.error instanceof Error ? input.error.message : String(input.error),
      retryable: true,
      prices: [],
      providerInput: {},
      providerOutput: {},
      threadCellPointer: input.thread.cursor,
      output: [],
    };
  }

  private finalizeResult(thread: ConversationThread, result: ProviderResult, modelCallId: string): ProviderResult {
    return {
      ...result,
      id: modelCallId,
      modelId: this.modelId,
      provider: this.providerId,
      threadCellPointer: thread.cursor,
    };
  }
}
