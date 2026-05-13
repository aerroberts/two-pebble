import type { ConversationThread, ProviderResult } from '@two-pebble/pebble';
import { ModelProvider } from '@two-pebble/pebble';
import { createDeferred } from './deferred';

/**
 * Provides a deterministic provider that pauses once the model turn starts.
 * Daemon bridge tests use the pause to call into live agents mid-run.
 * Releasing the provider lets the agent loop complete normally.
 */
export class BlockingProvider extends ModelProvider {
  public readonly modelId = 'mock-model';
  public readonly providerId = 'mock-provider';
  private readonly callStarted = createDeferred<void>();
  private readonly releaseCall = createDeferred<void>();

  /**
   * Resolves after the agent has reached the provider invocation.
   * Tests wait on this before sending daemon bridge commands.
   * This proves the target agent is live in the daemon registry.
   */
  public waitForCall() {
    return this.callStarted.promise;
  }

  /**
   * Allows the blocked provider invocation to finish.
   * Tests call this from cleanup so the run promise can settle.
   * The generated provider response contains no model output.
   */
  public release() {
    this.releaseCall.resolve();
  }

  protected async invokeProvider(thread: ConversationThread, modelCallId: string): Promise<ProviderResult> {
    const startedAt = Date.now();
    this.callStarted.resolve();
    await this.releaseCall.promise;
    return {
      completedAt: startedAt + 1,
      id: modelCallId,
      modelId: this.modelId,
      output: [],
      prices: [],
      provider: this.providerId,
      providerInput: { messages: thread.serialize(), model: this.modelId },
      providerOutput: { output: [] },
      startedAt,
      status: 'success',
      threadCellPointer: thread.cursor,
    };
  }
}
