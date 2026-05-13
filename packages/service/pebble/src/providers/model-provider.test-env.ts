import { expect } from 'bun:test';
import { ConversationThread } from '../thread/index';
import { RetryTestProvider } from './testing/retry-test-provider';
import type { ProviderResult } from './types';

type ExpectedProviderShape = object;

interface ExpectProviderResultInput {
  callId: string;
  calls: number;
  delays: number[];
  expected: ExpectedProviderShape;
  provider: RetryTestProvider;
}

export function successResult(): ProviderResult {
  const startedAt = Date.now();
  return {
    id: 'model-call-success',
    completedAt: startedAt + 1,
    status: 'success',
    modelId: 'retry-test-model',
    providerInput: {},
    providerOutput: {},
    provider: 'retry-test-provider',
    prices: [],
    startedAt,
    threadCellPointer: 'thread-test/1',
    output: [],
  };
}

export function errorResult(): ProviderResult {
  const startedAt = Date.now();
  return {
    id: 'model-call-error',
    completedAt: startedAt + 1,
    status: 'error',
    error: 'failed',
    modelId: 'retry-test-model',
    providerInput: {},
    providerOutput: {},
    provider: 'retry-test-provider',
    retryable: false,
    prices: [],
    startedAt,
    threadCellPointer: 'thread-test/1',
    output: [],
  };
}

export function retryableResult(): ProviderResult {
  return {
    ...errorResult(),
    retryable: true,
  };
}

export function testThread(): ConversationThread {
  return new ConversationThread({ cells: [], threadId: 'thread-test' });
}

export async function expectProviderResult(input: ExpectProviderResultInput): Promise<void> {
  await expect(input.provider.invoke(testThread(), input.callId)).resolves.toMatchObject(input.expected);
  expect(input.provider.calls).toBe(input.calls);
  expect(input.provider.delays).toEqual(input.delays);
}

export function retryingThrowProvider(): RetryTestProvider {
  return new RetryTestProvider([
    { throw: new Error('ECONNRESET') },
    { throw: new Error('socket hang up') },
    successResult(),
  ]);
}

export function exhaustedThrowProvider(): RetryTestProvider {
  return new RetryTestProvider([
    { throw: new Error('boom 1') },
    { throw: new Error('boom 2') },
    { throw: new Error('boom 3') },
    { throw: new Error('boom 4') },
    { throw: new Error('boom 5') },
  ]);
}
