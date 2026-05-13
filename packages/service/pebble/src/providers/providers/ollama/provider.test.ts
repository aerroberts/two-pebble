import { describe, expect, it } from 'bun:test';
import { Cell, ConversationThread } from '../../../thread/index';
import { ollamaProviderTestEnv } from './provider.test-env.builder';
import type { OllamaProviderRequest } from './types';

describe('feature: ollama provider', () => {
  const ollamaRequest: OllamaProviderRequest = {
    messages: [{ role: 'user', content: 'hello' }],
    model: 'llama-test',
    options: { stop: ['END_TURN'] },
    stream: false,
  };

  const ollamaResult = {
    status: 'success',
    output: [{ type: 'text', text: 'done' }],
    prices: [],
    providerInput: ollamaRequest,
    providerOutput: { message: { content: 'done' } },
  };

  const ollamaFetchRequests = [
    {
      body: ollamaRequest,
      headers: { 'content-type': 'application/json' },
      method: 'POST',
      url: 'https://ollama.test/api/chat',
    },
  ];

  it('happy: builds a request from serialized thread turns', () => {
    const ctx = ollamaProviderTestEnv();
    const provider = ctx.provider();

    expect(provider.buildRequest(ctx.thread())).toEqual(ollamaRequest);
  });

  it('happy: maps system thread turns to user provider messages', () => {
    const ctx = ollamaProviderTestEnv();
    const thread = new ConversationThread({ cells: [], threadId: 'thread-test' });
    thread.pushSystem('System Prompt', Cell.text('system context'));

    expect(ctx.provider().buildRequest(thread).messages).toEqual([{ role: 'user', content: 'system context' }]);
  });

  it('happy: invokes the Ollama API with fetch', async () => {
    const ctx = ollamaProviderTestEnv();
    ctx.useSuccessfulFetch();

    const result = await ctx.provider().invoke(ctx.thread(), 'model-call-ollama');

    expect(result).toMatchObject(ollamaResult);
    expect(result.id).toBe('model-call-ollama');
    expect(ctx.requests).toEqual(ollamaFetchRequests);
    ctx.restoreFetch();
  });
});
