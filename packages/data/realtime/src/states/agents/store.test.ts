import { describe, expect, test } from 'bun:test';
import { useAgents } from '../../index';
import { buildRealtimeContext } from '../../testing/realtime-context.builder';
import { installProviderFetchForTesting } from '../../testing/support/provider-fetch';
import { agentCreateInput, setupOpenAiAgentRegistry } from '../../testing/support/test-inputs';
import { launchCliAgentAndReadName } from './launch-cli-agent-test-helper';

describe('feature: realtime agents', () => {
  test('happy: backfill, hooks load current state', async () => {
    const ctx = await buildRealtimeContext({});
    const created = await ctx.daemon.backfill('createAgent', agentCreateInput());
    const agents = await ctx.realtime.renderHook(useAgents);
    const state = await agents.waitForItemCount(1);
    await ctx.close();
    expect(state.getItem(created.id)?.value?.name).toBe('Realtime Agent');
  });

  test('happy: backfill + realtime, hooks load current state and realtime hook listens to state changes', async () => {
    const ctx = await buildRealtimeContext({});
    await ctx.daemon.backfill('createAgent', agentCreateInput());
    const agents = await ctx.realtime.renderHook(useAgents);
    await ctx.daemon.do('createAgent', agentCreateInput());
    const state = await agents.waitForItemCount(2);
    await ctx.close();
    expect(state.values().map((agent) => agent.name)).toEqual(['Realtime Agent', 'Realtime Agent']);
  });

  test('happy: realtime, hook listens to state changes', async () => {
    const ctx = await buildRealtimeContext({});
    const agents = await ctx.realtime.renderHook(useAgents);
    const created = await ctx.daemon.do('createAgent', agentCreateInput());
    const state = await agents.waitForItemCount(1);
    await ctx.close();
    expect(state.getItem(created.id)?.value?.name).toBe('Realtime Agent');
  });

  test('happy: realtime, launch agent updates lifecycle state', async () => {
    const restoreFetch = installProviderFetchForTesting();
    const ctx = await buildRealtimeContext({});
    const agents = await ctx.realtime.renderHook(useAgents);
    const registry = await setupOpenAiAgentRegistry(ctx.daemon);
    const launched = await ctx.daemon.do('launchAgent', { agentRegistryId: registry.id, message: 'hello from test' });
    const state = await agents.waitFor((value) => value.getItem(launched.id)?.value?.status === 'idle');
    await ctx.close();
    restoreFetch();
    expect(state.getItem(launched.id)?.value?.name).toBe('Hello World Agent');
  });

  test('happy: realtime, launch selected CLI agent updates lifecycle state', async () => {
    const agentName = await launchCliAgentAndReadName();

    expect(agentName).toBe('CLI Agent Test');
  });

  test('happy: realtime, complete agent updates lifecycle state', async () => {
    const ctx = await buildRealtimeContext({});
    const agents = await ctx.realtime.renderHook(useAgents);
    const agent = await ctx.daemon.do('createAgent', agentCreateInput());
    await ctx.daemon.do('completeAgent', { id: agent.id });
    const state = await agents.waitFor((value) => value.getItem(agent.id)?.value?.status === 'offline');
    await ctx.close();
    expect(state.getItem(agent.id)?.value?.completedAt).not.toBeNull();
  });

  test('happy: realtime, fail agent updates lifecycle state', async () => {
    const ctx = await buildRealtimeContext({});
    const agents = await ctx.realtime.renderHook(useAgents);
    const agent = await ctx.daemon.do('createAgent', agentCreateInput());
    await ctx.daemon.do('failAgent', { id: agent.id });
    const state = await agents.waitFor((value) => value.getItem(agent.id)?.value?.status === 'failed');
    await ctx.close();
    expect(state.getItem(agent.id)?.value?.completedAt).not.toBeNull();
  });

  test('happy: backfill empty, hooks load empty state', async () => {
    const ctx = await buildRealtimeContext({});
    const agents = await ctx.realtime.renderHook(useAgents);
    const state = await agents.waitForStatus('ready');
    await ctx.close();
    expect(state.entries()).toEqual([]);
  });
});
