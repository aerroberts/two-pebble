import { describe, expect, test } from 'bun:test';
import { act } from 'react';
import { useAgentCalls } from '../../index';
import { buildRealtimeContext } from '../../testing/realtime-context.builder';
import { installProviderFetchForTesting } from '../../testing/support/provider-fetch';
import { agentCreateInput, modelCallRecordInput, setupOpenAiAgentRegistry } from '../../testing/support/test-inputs';
import { buildAgentCallHydrationTestEnv } from './agent-calls-test-env';

describe('feature: realtime model calls', () => {
  test('happy: backfill, hooks load current state', async () => {
    const ctx = await buildRealtimeContext({});
    const agent = await ctx.daemon.backfill('createAgent', agentCreateInput());
    const created = await ctx.daemon.backfill('recordAgentCall', modelCallRecordInput(agent.id));
    const modelCalls = await ctx.realtime.renderHook(() => useAgentCalls({ agentId: agent.id }));
    const state = await modelCalls.waitForItemCount(1);
    await ctx.close();
    expect(state.getItem(created.id)?.value?.modelId).toBe('gpt-test');
  });

  test('happy: read hydrates listed summaries with full data', async () => {
    const { created, ctx, hook } = await buildAgentCallHydrationTestEnv();
    await hook.waitFor((value) => value[0].getItem(created.id)?.value !== null);
    await act(async () => {
      await hook.current()[1]({ id: created.id });
    });
    const state = await hook.waitFor((value) => 'data' in (value[0].getItem(created.id)?.value ?? {}));
    await ctx.close();
    expect(state[0].getItem(created.id)?.value).toMatchObject({ data: { tokens: 42 } });
  });

  test('happy: backfill + realtime, hooks load current state and realtime hook listens to state changes', async () => {
    const ctx = await buildRealtimeContext({});
    const agent = await ctx.daemon.backfill('createAgent', agentCreateInput());
    await ctx.daemon.backfill('recordAgentCall', modelCallRecordInput(agent.id));
    const modelCalls = await ctx.realtime.renderHook(() => useAgentCalls({ agentId: agent.id }));
    await ctx.daemon.do('recordAgentCall', modelCallRecordInput(agent.id));
    const state = await modelCalls.waitForItemCount(2);
    await ctx.close();
    expect(state.values().map((call) => call.modelId)).toEqual(['gpt-test', 'gpt-test']);
  });

  test('happy: realtime, hook listens to state changes', async () => {
    const ctx = await buildRealtimeContext({});
    const agent = await ctx.daemon.backfill('createAgent', agentCreateInput());
    const modelCalls = await ctx.realtime.renderHook(() => useAgentCalls({ agentId: agent.id }));
    const created = await ctx.daemon.do('recordAgentCall', modelCallRecordInput(agent.id));
    const state = await modelCalls.waitForItemCount(1);
    await ctx.close();
    expect(state.getItem(created.id)?.value?.modelId).toBe('gpt-test');
  });

  test('happy: realtime, launch agent records model calls', async () => {
    const restoreFetch = installProviderFetchForTesting();
    const ctx = await buildRealtimeContext({});
    const modelCalls = await ctx.realtime.renderHook(() => useAgentCalls({ agentId: '' }));
    const registry = await setupOpenAiAgentRegistry(ctx.daemon);
    await ctx.daemon.do('launchAgent', { agentRegistryId: registry.id, message: 'hello from model call test' });
    const state = await modelCalls.waitForItemCount(1);
    await ctx.close();
    restoreFetch();
    expect(state.values()[0]?.modelId).toBe('gpt-test');
  });

  test('happy: backfill empty, hooks load empty state', async () => {
    const ctx = await buildRealtimeContext({});
    const agent = await ctx.daemon.backfill('createAgent', agentCreateInput());
    const modelCalls = await ctx.realtime.renderHook(() => useAgentCalls({ agentId: agent.id }));
    const state = await modelCalls.waitForStatus('ready');
    await ctx.close();
    expect(state.entries()).toEqual([]);
  });
});
