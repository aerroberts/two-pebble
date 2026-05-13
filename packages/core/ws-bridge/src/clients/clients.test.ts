import { describe, expect, test } from 'bun:test';
import { expectJsonlSnapshot, healthServerTestEnv, wsClientServerTestEnv } from './clients.test-env.builder';

describe('feature: WebSocket bridge clients', () => {
  test('snapshot: client and server talk over WebSocket and snapshot every wire frame', async () => {
    const ctx = await wsClientServerTestEnv().launch();
    expect(await ctx.runConversation()).toEqual({
      serverAnnouncement: 'server-ready',
      result: { value: 10 },
      receivedClientAnnouncement: 'client-ready',
    });
    await expectJsonlSnapshot('client-server-wire.jsonl', ctx.normalizedWire());
    await expectJsonlSnapshot('client-server-lifecycle.jsonl', ctx.lifecycle);
  });

  test('snapshot: missing server operation sends an error response over the wire', async () => {
    const ctx = await wsClientServerTestEnv().launch();

    await expect(ctx.runMissingOperation()).rejects.toThrow('No handler registered for operation: explode');
    await expectJsonlSnapshot('missing-operation-wire.jsonl', ctx.normalizedWire());
  });

  test('happy: server can serve non-WebSocket HTTP responses before upgrade handling', async () => {
    const ctx = healthServerTestEnv();

    await expectJsonlSnapshot('http-health.jsonl', await ctx.rows());
  });
});
