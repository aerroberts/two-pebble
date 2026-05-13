import { describe, expect, test } from 'bun:test';
import { bridgeTestEnv, expectJsonlSnapshot } from './bridge.test-env.builder';

describe('feature: Bridge round-trip', () => {
  test('happy: routes an operation request and resolves with the typed response', async () => {
    const ctx = bridgeTestEnv().connect().onPing();

    const result = await ctx.client.do('ping', { value: 41 });

    expect(result.value).toBe(42);
  });

  test('happy: fans out events to subscribed listeners', async () => {
    const ctx = bridgeTestEnv().connect();

    expect(await ctx.announce()).toBe('hello');
  });

  test('unhappy: rejects missing operation handlers', async () => {
    const ctx = bridgeTestEnv().connect();

    await expect(ctx.client.do('explode', { value: 1 })).rejects.toThrow(
      'No handler registered for operation: explode',
    );
  });

  test('unhappy: rejects thrown operation handler errors', async () => {
    const ctx = bridgeTestEnv().connect().onExplode();

    await expect(ctx.client.do('explode', { value: 1 })).rejects.toThrow('operation failed on purpose');
  });

  test('happy: unlisten stops event delivery', () => {
    const ctx = bridgeTestEnv().connect();

    expect(ctx.unlistenResult()).toEqual(['before']);
  });
});

describe('feature: Bridge jsonl snapshots', () => {
  test('snapshot: operation success message flow stays stable', async () => {
    const ctx = bridgeTestEnv().connect().onPing();

    await ctx.client.do('ping', { value: 41 });

    await expectJsonlSnapshot('operation-success.jsonl', ctx.normalizedMessages());
  });

  test('snapshot: event message flow stays stable', async () => {
    const ctx = bridgeTestEnv().captureServerOnly();

    ctx.server.emit('announce', 'hello');

    await expectJsonlSnapshot('event.jsonl', ctx.normalizedMessages());
  });

  test('snapshot: operation error message flow stays stable', async () => {
    const ctx = bridgeTestEnv().connect();

    await expect(ctx.client.do('explode', { value: 41 })).rejects.toThrow(
      'No handler registered for operation: explode',
    );

    await expectJsonlSnapshot('operation-error.jsonl', ctx.normalizedMessages());
  });
});
