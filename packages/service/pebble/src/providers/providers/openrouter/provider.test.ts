import { describe, expect, it } from 'bun:test';
import { Cell, ConversationThread } from '../../../thread/index';
import { openRouterProviderTestEnv } from './provider.test-env.builder';
import type { OpenRouterProviderRequest } from './types';

describe('feature: openrouter provider', () => {
  const openRouterRequest: OpenRouterProviderRequest = {
    model: 'openrouter-test',
    messages: [{ role: 'user', content: 'hello' }],
    stop: ['END_TURN'],
  };

  const openRouterResult = {
    status: 'success',
    prices: [],
    output: [{ type: 'text', text: 'done' }],
    providerInput: openRouterRequest,
    providerOutput: { choices: [{ message: { content: 'done' } }] },
  };

  const openRouterFetchRequests = [
    {
      url: 'https://openrouter.test/api/v1/chat/completions',
      method: 'POST',
      headers: {
        authorization: 'Bearer openrouter-key',
        'content-type': 'application/json',
        'http-referer': 'https://two-pebble.test',
        'x-title': 'Two Pebble',
      },
      body: openRouterRequest,
    },
  ];

  it('happy: builds a request from serialized thread turns', () => {
    const ctx = openRouterProviderTestEnv();
    const provider = ctx.provider();

    expect(provider.buildRequest(ctx.thread())).toEqual(openRouterRequest);
  });

  it('happy: maps system thread turns to user provider messages', () => {
    const ctx = openRouterProviderTestEnv();
    const thread = new ConversationThread({ cells: [], threadId: 'thread-test' });
    thread.pushSystem('System Prompt', Cell.text('system context'));

    expect(ctx.provider().buildRequest(thread).messages).toEqual([{ role: 'user', content: 'system context' }]);
  });

  it('happy: invokes the OpenRouter API with fetch', async () => {
    const ctx = openRouterProviderTestEnv();
    ctx.useSuccessfulFetch();

    const result = await ctx.provider().invoke(ctx.thread(), 'model-call-openrouter');

    expect(result).toMatchObject(openRouterResult);
    expect(result.id).toBe('model-call-openrouter');
    expect(ctx.requests).toEqual(openRouterFetchRequests);
    ctx.restoreFetch();
  });
});
