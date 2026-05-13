import type { ConversationThread } from '../thread/index';
import type { ProviderResult } from './types';
import { withRetries } from './utils/retry';

/**
 * Base class for model provider adapters.
 * Providers share thread serialization while owning transport details.
 */
export abstract class ModelProvider {
  /**
   * Sentinel string the agent emits to signal end-of-turn. Chat providers
   * pass it as a stop sequence so the upstream API halts as soon as the
   * model writes it, sparing a token-by-token tail. Lives on the abstract
   * base because it is part of the agent ↔ provider contract.
   */
  public static readonly END_TURN_STOP_TOKEN = 'END_TURN';

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
      (error) => this.exceptionToResult(error, modelCallId, thread, startedAt),
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

  private exceptionToResult(
    error: unknown,
    modelCallId: string,
    thread: ConversationThread,
    startedAt: number,
  ): ProviderResult {
    return {
      id: modelCallId,
      startedAt,
      completedAt: Date.now(),
      modelId: this.modelId,
      provider: this.providerId,
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      retryable: true,
      prices: [],
      providerInput: {},
      providerOutput: {},
      threadCellPointer: thread.cursor,
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
