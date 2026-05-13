import { describe, expect, it } from 'bun:test';
import { RetryTestSpeechProvider } from './retry-test-speech-provider';
import { nonRetryableSpeechResult, retryableSpeechResult, speechInput } from './speech-provider.test-results';

describe('feature: speech provider retry', () => {
  it('happy: retries retryable results with exponential backoff', async () => {
    const provider = new RetryTestSpeechProvider([retryableSpeechResult(), retryableSpeechResult()]);
    await expect(provider.synthesize(speechInput, 'speech-call')).resolves.toMatchObject({ status: 'success' });
    expect(provider.calls).toBe(3);
    expect(provider.delays).toEqual([5000, 10_000]);
  });

  it('happy: retries thrown transport errors', async () => {
    const provider = new RetryTestSpeechProvider([{ throw: new Error('ECONNRESET') }]);
    await expect(provider.synthesize(speechInput, 'speech-call')).resolves.toMatchObject({ status: 'success' });
    expect(provider.calls).toBe(2);
    expect(provider.delays).toEqual([5000]);
  });

  it('unhappy: does not retry non-retryable results', async () => {
    const provider = new RetryTestSpeechProvider([nonRetryableSpeechResult()]);
    await expect(provider.synthesize(speechInput, 'speech-call')).resolves.toMatchObject({ status: 'error' });
    expect(provider.calls).toBe(1);
    expect(provider.delays).toEqual([]);
  });
});
