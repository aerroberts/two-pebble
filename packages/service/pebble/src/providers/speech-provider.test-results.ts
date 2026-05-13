import type { SpeechInput, SpeechResult } from './types';

export const speechInput: SpeechInput = { text: 'hello', voice: 'alloy' };

export function retryableSpeechResult(): SpeechResult {
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

export function nonRetryableSpeechResult(): SpeechResult {
  return { ...retryableSpeechResult(), retryable: false };
}
