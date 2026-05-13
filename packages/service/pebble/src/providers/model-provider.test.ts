import { describe, it } from 'bun:test';
import {
  errorResult,
  exhaustedThrowProvider,
  expectProviderResult,
  retryableResult,
  retryingThrowProvider,
  successResult,
} from './model-provider.test-env';
import { RetryTestProvider } from './testing/retry-test-provider';

describe('feature: model provider retry', () => {
  const fiveRetryable = [retryableResult(), retryableResult(), retryableResult(), retryableResult(), retryableResult()];
  const fourDelays = [5000, 10_000, 20_000, 30_000];

  it('happy: retries retryable provider results with exponential backoff', async () => {
    const provider = new RetryTestProvider([retryableResult(), retryableResult(), successResult()]);
    await expectProviderResult({
      provider,
      callId: 'model-call-retry',
      expected: { id: 'model-call-retry', status: 'success' },
      calls: 3,
      delays: [5000, 10_000],
    });
  });

  it('unhappy: stops after five retryable attempts', async () => {
    const provider = new RetryTestProvider(fiveRetryable);
    await expectProviderResult({
      provider,
      callId: 'model-call-retry',
      expected: { id: 'model-call-retry', status: 'error' },
      calls: 5,
      delays: fourDelays,
    });
  });

  it('unhappy: does not retry non-retryable provider results', async () => {
    const provider = new RetryTestProvider([errorResult()]);
    await expectProviderResult({
      provider,
      callId: 'model-call-error',
      expected: { id: 'model-call-error', status: 'error' },
      calls: 1,
      delays: [],
    });
  });

  it('happy: retries thrown transport errors as retryable failures', async () => {
    const provider = retryingThrowProvider();
    await expectProviderResult({
      provider,
      callId: 'model-call-throw',
      expected: { id: 'model-call-throw', status: 'success' },
      calls: 3,
      delays: [5000, 10_000],
    });
  });

  it('unhappy: surfaces the last thrown error after exhausting attempts', async () => {
    const provider = exhaustedThrowProvider();
    await expectProviderResult({
      provider,
      callId: 'model-call-throw-exhaust',
      expected: { id: 'model-call-throw-exhaust', status: 'error', retryable: true, error: 'boom 5' },
      calls: 5,
      delays: fourDelays,
    });
  });
});
