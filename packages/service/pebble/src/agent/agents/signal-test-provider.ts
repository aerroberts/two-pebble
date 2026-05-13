import { ModelProvider } from '../../providers';
import type { ConversationThread } from '../../thread';

/**
 * Provider that first asks for the signal tool and then returns text.
 * The invoke count lets the test assert that signal resume caused a
 * second provider pass.
 */
export class SignalTestProvider extends ModelProvider {
  public readonly modelId = 'signal-test-model';
  public readonly providerId = 'signal-test-provider';
  public invokeCount = 0;

  protected override async invokeProvider(thread: ConversationThread, modelCallId: string) {
    this.invokeCount += 1;
    return {
      completedAt: Date.now(),
      id: modelCallId,
      modelId: this.modelId,
      output:
        this.invokeCount === 1
          ? [{ callid: 'call-signal', payload: {}, toolid: 'wait-for-signal', type: 'tool' as const }]
          : [{ text: 'resumed', type: 'text' as const }],
      prices: [],
      provider: this.providerId,
      providerInput: {},
      providerOutput: {},
      startedAt: Date.now(),
      status: 'success' as const,
      threadCellPointer: thread.cursor,
    };
  }
}
