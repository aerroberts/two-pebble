import { describe, expect, it } from 'bun:test';
import { Cell, ConversationThread } from '../../../thread/index';
import { anthropicProviderTestEnv } from './provider.test-env.builder';
import type { AnthropicProviderRequest } from './types';

describe('feature: anthropic provider', () => {
  const anthropicRequest: AnthropicProviderRequest = {
    max_tokens: 1000,
    messages: [{ role: 'user', content: 'hello' }],
    model: 'claude-sonnet-4',
    stop_sequences: ['END_TURN'],
  };

  const anthropicResult = {
    status: 'success',
    prices: [
      {
        provider: 'anthropic',
        modelId: 'claude-sonnet-4',
        charge: 'input-tokens-read-uncached',
        price: 0.000003,
        quantity: 10,
        timestamp: expect.any(Number),
        total: 0.00003,
      },
      {
        provider: 'anthropic',
        modelId: 'claude-sonnet-4',
        charge: 'input-tokens-read-cached',
        price: 3e-7,
        quantity: 2,
        timestamp: expect.any(Number),
        total: 6e-7,
      },
      {
        provider: 'anthropic',
        modelId: 'claude-sonnet-4',
        charge: 'input-tokens-write-cached',
        price: 0.00000375,
        quantity: 3,
        timestamp: expect.any(Number),
        total: 0.00001125,
      },
      {
        provider: 'anthropic',
        modelId: 'claude-sonnet-4',
        charge: 'output-tokens-generated',
        price: 0.000015,
        quantity: 4,
        timestamp: expect.any(Number),
        total: 0.00006,
      },
    ],
    output: [{ type: 'text', text: 'done' }],
    providerInput: anthropicRequest,
    providerOutput: {
      content: [{ type: 'text', text: 'done' }],
      usage: {
        cache_creation_input_tokens: 3,
        cache_read_input_tokens: 2,
        input_tokens: 10,
        output_tokens: 4,
      },
    },
  };

  const anthropicFetchRequests = [
    {
      url: 'https://anthropic.test/v1/messages',
      method: 'POST',
      headers: {
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'x-api-key': 'anthropic-key',
      },
      body: anthropicRequest,
    },
  ];

  it('happy: builds a request from serialized thread turns', () => {
    const ctx = anthropicProviderTestEnv();
    const provider = ctx.provider();

    expect(provider.buildRequest(ctx.thread())).toEqual(anthropicRequest);
  });

  it('happy: maps system thread turns to user provider messages', () => {
    const ctx = anthropicProviderTestEnv();
    const thread = new ConversationThread({ cells: [], threadId: 'thread-test' });
    thread.pushSystem('System Prompt', Cell.text('system context'));

    expect(ctx.provider().buildRequest(thread).messages).toEqual([{ role: 'user', content: 'system context' }]);
  });

  it('happy: invokes the Anthropic API with fetch', async () => {
    const ctx = anthropicProviderTestEnv();
    ctx.useSuccessfulFetch();

    const result = await ctx.provider().invoke(ctx.thread(), 'model-call-anthropic');

    expect(result).toMatchObject(anthropicResult);
    expect(result.id).toBe('model-call-anthropic');
    expect(ctx.requests).toEqual(anthropicFetchRequests);
    ctx.restoreFetch();
  });
});
