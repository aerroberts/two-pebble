import type { ConversationThread } from '../../thread';
import { ModelProvider } from '../model-provider';
import type { ProviderOutputBlock, ProviderResult } from '../types';

/**
 * Provides deterministic model outputs for provider and agent tests.
 * The provider owns queued responses and captured calls.
 * Transport, pricing, and provider API behavior remain outside this test helper.
 */
export class MockProvider extends ModelProvider {
  public readonly modelId = 'mock-model';
  public readonly providerId = 'mock-provider';
  public readonly calls: ProviderResult[] = [];
  private readonly outputs: ProviderOutputBlock[][];

  public constructor(outputs: ProviderOutputBlock[][]) {
    super();
    this.outputs = outputs;
  }

  protected async invokeProvider(thread: ConversationThread, modelCallId: string): Promise<ProviderResult> {
    const startedAt = Date.now();
    const output = this.outputs.shift() ?? [];
    const result: ProviderResult = {
      id: modelCallId,
      completedAt: startedAt + 1,
      modelId: this.modelId,
      output,
      prices: [],
      provider: this.providerId,
      providerInput: { messages: thread.serialize(), model: this.modelId },
      providerOutput: { output },
      startedAt,
      status: 'success',
      threadCellPointer: thread.cursor,
    };
    this.calls.push(result);
    return result;
  }
}
