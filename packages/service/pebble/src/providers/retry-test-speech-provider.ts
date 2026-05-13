import { SpeechProvider } from './speech-provider';
import type { SpeechScriptStep } from './speech-provider.test-types';
import type { SpeechInput, SpeechResult } from './types';

/**
 * Deterministic speech provider used by retry tests.
 * It records delay requests instead of sleeping and consumes scripted
 * results so tests can assert retry behavior without real transport.
 */
export class RetryTestSpeechProvider extends SpeechProvider {
  public readonly delays: number[] = [];
  public readonly modelId = 'retry-test-speech';
  public readonly providerId = 'retry-test-provider';
  public calls = 0;

  public constructor(private readonly script: SpeechScriptStep[]) {
    super();
  }

  protected async synthesizeOnce(_input: SpeechInput, callId: string): Promise<SpeechResult> {
    this.calls += 1;
    const step = this.script.shift();
    if (step === undefined) {
      return this.successResult(callId);
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

  private successResult(callId: string): SpeechResult {
    const startedAt = Date.now();
    return {
      id: callId,
      startedAt,
      completedAt: startedAt + 1,
      status: 'success',
      modelId: this.modelId,
      provider: this.providerId,
      base64Data: 'ZGF0YQ==',
      mimeType: 'audio/mpeg',
      prices: [],
      providerInput: {},
      providerOutput: {},
    };
  }
}
