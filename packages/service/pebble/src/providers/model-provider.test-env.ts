import type { ProviderResult } from './types';

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
