import { describe, expect, test } from 'bun:test';
import { useAgents, useAgentTraces } from '../../index';
import { buildRealtimeContext } from '../../testing/realtime-context.builder';
import { installProviderFetchForTesting } from '../../testing/support/provider-fetch';
import { agentCreateInput, setupOpenAiAgentRegistry, traceRecordInput } from '../../testing/support/test-inputs';

describe('feature: realtime agent traces', () => {
  test('happy: backfill, hooks load current state', async () => {
    const ctx = await buildRealtimeContext({});
    const agent = await ctx.daemon.backfill('createAgent', agentCreateInput());
    const created = await ctx.daemon.backfill('recordAgentTrace', traceRecordInput(agent.id));
    const traces = await ctx.realtime.renderHook(() => useAgentTraces({ agentId: agent.id }));
    const state = await traces.waitForItemCount(1);
    await ctx.close();
    expect(state.getItem(created.id)?.value?.type).toBe('user-message');
  });

  test('happy: backfill + realtime, hooks load current state and realtime hook listens to state changes', async () => {
    const ctx = await buildRealtimeContext({});
    const agent = await ctx.daemon.backfill('createAgent', agentCreateInput());
    await ctx.daemon.backfill('recordAgentTrace', traceRecordInput(agent.id));
    const traces = await ctx.realtime.renderHook(() => useAgentTraces({ agentId: agent.id }));
    await ctx.daemon.do('recordAgentTrace', traceRecordInput(agent.id));
    const state = await traces.waitForItemCount(2);
    await ctx.close();
    expect(state.values().map((trace) => trace.type)).toEqual(['user-message', 'user-message']);
  });

  test('happy: realtime, hook listens to state changes', async () => {
    const ctx = await buildRealtimeContext({});
    await ctx.realtime.renderHook(useAgents);
    const agent = await ctx.daemon.do('createAgent', agentCreateInput());
    const traces = await ctx.realtime.renderHook(() => useAgentTraces({ agentId: agent.id }));
    const created = await ctx.daemon.do('recordAgentTrace', traceRecordInput(agent.id));
    const state = await traces.waitForItemCount(1);
    await ctx.close();
    expect(state.getItem(created.id)?.value?.type).toBe('user-message');
  });

  test('happy: realtime, launch agent streams trace events', async () => {
    const restoreFetch = installProviderFetchForTesting();
    const ctx = await buildRealtimeContext({});
    const traces = await ctx.realtime.renderHook(() => useAgentTraces({ agentId: '' }));
    const registry = await setupOpenAiAgentRegistry(ctx.daemon);
    await ctx.daemon.do('launchAgent', { agentRegistryId: registry.id, message: 'hello from trace test' });
    const state = await traces.waitFor((value) => value.values().some((trace) => trace.type === 'agent-success'));
    await ctx.close();
    restoreFetch();
    expect(state.values().map((trace) => trace.type)).toContain('agent-success');
  });

  test('happy: backfill empty, hooks load empty state', async () => {
    const ctx = await buildRealtimeContext({});
    const agent = await ctx.daemon.backfill('createAgent', agentCreateInput());
    const traces = await ctx.realtime.renderHook(() => useAgentTraces({ agentId: agent.id }));
    const state = await traces.waitForStatus('ready');
    await ctx.close();
    expect(state.entries()).toEqual([]);
  });
});
