import { describe, expect, it } from 'bun:test';
import { SpeechProvider } from './speech-provider';
import type { SpeechInput, SpeechResult } from './types';

type ScriptStep = SpeechResult | { throw: Error };

class RetryTestSpeechProvider extends SpeechProvider {
  public readonly delays: number[] = [];
  public readonly modelId = 'retry-test-speech';
  public readonly providerId = 'retry-test-provider';
  public calls = 0;

  public constructor(private readonly script: ScriptStep[]) {
    super();
  }

  protected async synthesizeOnce(_input: SpeechInput, callId: string): Promise<SpeechResult> {
    this.calls += 1;
    const step = this.script.shift();
    if (step === undefined) return this.successResult(callId);
    if ('throw' in step) throw step.throw;
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

function retryableResult(): SpeechResult {
  const startedAt = Date.now();
  return {
    id: 'speech-call',
    startedAt,
    completedAt: startedAt + 1,
    status: 'error',
    error: 'failed',
    retryable: true,
    modelId: 'retry-test-speech',
    provider: 'retry-test-provider',
    base64Data: '',
    mimeType: 'audio/mpeg',
    prices: [],
    providerInput: {},
    providerOutput: {},
  };
}

function nonRetryableResult(): SpeechResult {
  return { ...retryableResult(), retryable: false };
}

const input: SpeechInput = { text: 'hello', voice: 'alloy' };

describe('feature: speech provider retry', () => {
  it('happy: retries retryable results with exponential backoff', async () => {
    const provider = new RetryTestSpeechProvider([retryableResult(), retryableResult()]);
    await expect(provider.synthesize(input, 'speech-call')).resolves.toMatchObject({ status: 'success' });
    expect(provider.calls).toBe(3);
    expect(provider.delays).toEqual([5000, 10_000]);
  });

  it('happy: retries thrown transport errors', async () => {
    const provider = new RetryTestSpeechProvider([{ throw: new Error('ECONNRESET') }]);
    await expect(provider.synthesize(input, 'speech-call')).resolves.toMatchObject({ status: 'success' });
    expect(provider.calls).toBe(2);
    expect(provider.delays).toEqual([5000]);
  });

  it('unhappy: does not retry non-retryable results', async () => {
    const provider = new RetryTestSpeechProvider([nonRetryableResult()]);
    await expect(provider.synthesize(input, 'speech-call')).resolves.toMatchObject({ status: 'error' });
    expect(provider.calls).toBe(1);
    expect(provider.delays).toEqual([]);
  });
});
