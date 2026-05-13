import { describe, expect, it } from 'bun:test';
import { ConversationThread } from '../thread/index';
import { errorResult, retryableResult, successResult } from './model-provider.test-env';
import { RetryTestProvider } from './testing/retry-test-provider';

describe('feature: model provider retry', () => {
  const thread = () => new ConversationThread({ cells: [], threadId: 'thread-test' });
  const fiveRetryable = [retryableResult(), retryableResult(), retryableResult(), retryableResult(), retryableResult()];
  const fourDelays = [5000, 10_000, 20_000, 30_000];

  it('happy: retries retryable provider results with exponential backoff', async () => {
    const provider = new RetryTestProvider([retryableResult(), retryableResult(), successResult()]);
    await expect(provider.invoke(thread(), 'model-call-retry')).resolves.toMatchObject({
      id: 'model-call-retry',
      status: 'success',
    });
    expect(provider.calls).toBe(3);
    expect(provider.delays).toEqual([5000, 10_000]);
  });

  it('unhappy: stops after five retryable attempts', async () => {
    const provider = new RetryTestProvider(fiveRetryable);
    await expect(provider.invoke(thread(), 'model-call-retry')).resolves.toMatchObject({
      id: 'model-call-retry',
      status: 'error',
    });
    expect(provider.calls).toBe(5);
    expect(provider.delays).toEqual(fourDelays);
  });

  it('unhappy: does not retry non-retryable provider results', async () => {
    const provider = new RetryTestProvider([errorResult()]);
    await expect(provider.invoke(thread(), 'model-call-error')).resolves.toMatchObject({
      id: 'model-call-error',
      status: 'error',
    });
    expect(provider.calls).toBe(1);
    expect(provider.delays).toEqual([]);
  });

  it('happy: retries thrown transport errors as retryable failures', async () => {
    const provider = new RetryTestProvider([
      { throw: new Error('ECONNRESET') },
      { throw: new Error('socket hang up') },
      successResult(),
    ]);
    await expect(provider.invoke(thread(), 'model-call-throw')).resolves.toMatchObject({
      id: 'model-call-throw',
      status: 'success',
    });
    expect(provider.calls).toBe(3);
    expect(provider.delays).toEqual([5000, 10_000]);
  });

  it('unhappy: surfaces the last thrown error after exhausting attempts', async () => {
    const provider = new RetryTestProvider([
      { throw: new Error('boom 1') },
      { throw: new Error('boom 2') },
      { throw: new Error('boom 3') },
      { throw: new Error('boom 4') },
      { throw: new Error('boom 5') },
    ]);
    await expect(provider.invoke(thread(), 'model-call-throw-exhaust')).resolves.toMatchObject({
      id: 'model-call-throw-exhaust',
      status: 'error',
      retryable: true,
      error: 'boom 5',
    });
    expect(provider.calls).toBe(5);
    expect(provider.delays).toEqual(fourDelays);
  });
});
