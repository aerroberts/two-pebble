import { describe, expect, test } from 'bun:test';
import { useDebugLogContent, useDebugLogs, useRealtimeStore } from '../../index';
import { buildRealtimeContext } from '../../testing/realtime-context.builder';

describe('feature: realtime debug logs', () => {
  test('happy: backfill, hooks load current state', async () => {
    const ctx = await buildRealtimeContext({});
    const logs = await ctx.realtime.renderHook(useDebugLogs);
    const state = await logs.waitForStatus('ready');
    await ctx.close();
    expect(state.values().length).toBeGreaterThan(0);
  });

  test('happy: backfill + realtime, hooks load current state and realtime hook listens to state changes', async () => {
    const ctx = await buildRealtimeContext({});
    const logs = await ctx.realtime.renderHook(useDebugLogs);
    const initial = await logs.waitForItemCount(1);
    const sizeBytes = initial.values()[0]?.sizeBytes ?? 0;
    await ctx.daemon.do('listIntegrations', { limit: 50, offset: 0 });
    const state = await logs.waitFor((value) => (value.values()[0]?.sizeBytes ?? 0) > sizeBytes);
    await ctx.close();
    expect(state.values()[0]?.sizeBytes).toBeGreaterThan(sizeBytes);
  });

  test('happy: realtime, hook listens to state changes', async () => {
    const ctx = await buildRealtimeContext({ logFileName: 'daemon.txt' });
    const logs = await ctx.realtime.renderHook(useDebugLogs);
    await ctx.daemon.do('listIntegrations', { limit: 50, offset: 0 });
    const state = await logs.waitForItemCount(0);
    await ctx.close();
    expect(state.entries()).toEqual([]);
  });

  test('happy: backfill empty, hooks load empty state', async () => {
    const ctx = await buildRealtimeContext({ logFileName: 'daemon.txt' });
    const logs = await ctx.realtime.renderHook(useDebugLogs);
    const state = await logs.waitForStatus('ready');
    await ctx.close();
    expect(state.entries()).toEqual([]);
  });

  test('happy: content hook reads log content without caching content in realtime state', async () => {
    const ctx = await buildRealtimeContext({});
    const rendered = await ctx.realtime.renderHook(
      () => [useDebugLogContent('daemon.log'), useRealtimeStore((state) => state.debugLogs)] as const,
    );
    const state = await rendered.waitFor(
      ([content, logs]) => content.status === 'ready' && logs.getItem('daemon.log')?.status === 'ready',
    );
    await ctx.close();
    expect(typeof state[0].log?.content).toBe('string');
    expect(state[1].getItem('daemon.log')?.value).not.toHaveProperty('content');
  });
});
