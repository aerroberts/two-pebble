import { describe, expect, it } from 'bun:test';
import { Cell, ConversationThread } from '../../../thread/index';
import { openaiProviderTestEnv } from './provider.test-env.builder';
import type { OpenAIProviderRequest } from './types';

describe('feature: openai provider', () => {
  const openaiRequest: OpenAIProviderRequest = {
    model: 'gpt-5.2',
    messages: [{ role: 'user', content: 'hello' }],
    stop: ['END_TURN'],
  };

  const openaiResult = {
    status: 'success',
    prices: [
      {
        provider: 'openai',
        modelId: 'gpt-5.2',
        charge: 'input-tokens-read-uncached',
        price: 0.00000175,
        quantity: 8,
        timestamp: expect.any(Number),
        total: 0.000014,
      },
      {
        provider: 'openai',
        modelId: 'gpt-5.2',
        charge: 'input-tokens-read-cached',
        price: 1.75e-7,
        quantity: 2,
        timestamp: expect.any(Number),
        total: 3.5e-7,
      },
      {
        provider: 'openai',
        modelId: 'gpt-5.2',
        charge: 'output-tokens-generated',
        price: 0.000014,
        quantity: 3,
        timestamp: expect.any(Number),
        total: 0.000042,
      },
      {
        provider: 'openai',
        modelId: 'gpt-5.2',
        charge: 'thinking-tokens-generated',
        price: 0.000014,
        quantity: 1,
        timestamp: expect.any(Number),
        total: 0.000014,
      },
    ],
    output: [{ type: 'text', text: 'done' }],
    providerInput: openaiRequest,
    providerOutput: {
      choices: [{ message: { content: 'done' } }],
      usage: {
        completion_tokens: 4,
        completion_tokens_details: { reasoning_tokens: 1 },
        prompt_tokens: 10,
        prompt_tokens_details: { cached_tokens: 2 },
      },
    },
  };

  const openaiFetchRequests = [
    {
      url: 'https://openai.test/v1/chat/completions',
      method: 'POST',
      headers: { authorization: 'Bearer openai-key', 'content-type': 'application/json' },
      body: openaiRequest,
    },
  ];

  const audioRequestMessages: OpenAIProviderRequest['messages'] = [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'listen' },
        { type: 'input_audio', input_audio: { data: 'AAAA', format: 'wav' } },
      ],
    },
  ];

  it('happy: builds a request from serialized thread turns', () => {
    const ctx = openaiProviderTestEnv();
    const provider = ctx.provider();

    expect(provider.buildRequest(ctx.thread())).toEqual(openaiRequest);
  });

  it('happy: emits input_audio content blocks for audio cells', () => {
    const ctx = openaiProviderTestEnv();
    const thread = new ConversationThread({ cells: [], threadId: 'thread-test' });
    thread.pushUser('Voice', Cell.text('listen'), Cell.audio({ base64Data: 'AAAA', mimeType: 'audio/wav' }));

    expect(ctx.provider().buildRequest(thread).messages).toEqual(audioRequestMessages);
  });

  it('happy: maps system thread turns to user provider messages', () => {
    const ctx = openaiProviderTestEnv();
    const thread = new ConversationThread({ cells: [], threadId: 'thread-test' });
    thread.pushSystem('System Prompt', Cell.text('system context'));

    expect(ctx.provider().buildRequest(thread).messages).toEqual([{ role: 'user', content: 'system context' }]);
  });

  it('happy: invokes the OpenAI API with fetch', async () => {
    const ctx = openaiProviderTestEnv();
    ctx.useSuccessfulFetch();

    const result = await ctx.provider().invoke(ctx.thread(), 'model-call-openai');

    expect(result).toMatchObject(openaiResult);
    expect(result.id).toBe('model-call-openai');
    expect(ctx.requests).toEqual(openaiFetchRequests);
    ctx.restoreFetch();
  });
});
