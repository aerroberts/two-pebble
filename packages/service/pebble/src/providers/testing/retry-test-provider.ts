import type { ConversationThread } from '../../thread';
import { ModelProvider } from '../model-provider';
import type { ProviderResult } from '../types';
import type { ScriptStep } from './retry-test-provider-types';

/**
 * Provides deterministic retry responses for model provider tests.
 * The fixture records retry delays without sleeping.
 * Provider transport behavior stays outside this test helper.
 *
 * Scripted steps may be either a `ProviderResult` (returned as-is) or
 * `{ throw: Error }` (causes `invokeProvider` to throw) so tests can exercise
 * the base class's exception-to-result conversion path.
 */
export class RetryTestProvider extends ModelProvider {
  public readonly delays: number[] = [];
  public readonly modelId = 'retry-test-model';
  public readonly providerId = 'retry-test-provider';
  public calls = 0;
  private readonly script: ScriptStep[];

  public constructor(script: ScriptStep[]) {
    super();
    this.script = script;
  }

  protected async invokeProvider(_thread: ConversationThread, _modelCallId: string) {
    this.calls += 1;
    const step = this.script.shift();
    if (step === undefined) {
      return this.successResult();
    }
    if ('throw' in step) {
      throw step.throw;
    }
    return step;
  }

  protected override sleep(ms: number): Promise<void> {
    this.delays.push(ms);
    return Promise.resolve();
  }

  private successResult(): ProviderResult {
    const startedAt = Date.now();
    return {
      id: 'model-call-success',
      completedAt: startedAt + 1,
      status: 'success',
      modelId: this.modelId,
      providerInput: {},
      providerOutput: {},
      provider: this.providerId,
      prices: [],
      startedAt,
      threadCellPointer: 'thread-test/1',
      output: [],
    };
  }
}
