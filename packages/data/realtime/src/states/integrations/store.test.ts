import { describe, expect, test } from 'bun:test';
import { useIntegrations } from '../../index';
import { buildRealtimeContext } from '../../testing/realtime-context.builder';
import {
  anthropicIntegrationInput,
  emptyAnthropicIntegrationInput,
  openAiIntegrationInput,
  openRouterIntegrationInput,
  updatedAnthropicIntegrationInput,
} from '../../testing/support/test-inputs';

describe('feature: realtime integrations', () => {
  test('happy: backfill, hooks load current state', async () => {
    const ctx = await buildRealtimeContext({});
    const created = await ctx.daemon.backfill('createIntegration', openAiIntegrationInput());
    const integrations = await ctx.realtime.renderHook(useIntegrations);
    const state = await integrations.waitForItemCount(1);
    await ctx.close();
    expect(state.getItem(created.id)?.value?.provider).toBe('openai');
  });

  test('happy: backfill + realtime, hooks load current state and realtime hook listens to state changes', async () => {
    const ctx = await buildRealtimeContext({});
    await ctx.daemon.backfill('createIntegration', openAiIntegrationInput());
    const integrations = await ctx.realtime.renderHook(useIntegrations);
    await ctx.daemon.do('createIntegration', anthropicIntegrationInput());
    const state = await integrations.waitForItemCount(2);
    await ctx.close();
    expect(state.values()).toContainEqual(expect.objectContaining({ provider: 'anthropic' }));
    expect(state.values()).toContainEqual(expect.objectContaining({ provider: 'openai' }));
  });

  test('happy: realtime, hook listens to state changes', async () => {
    const ctx = await buildRealtimeContext({});
    const integrations = await ctx.realtime.renderHook(useIntegrations);
    await ctx.daemon.do('createIntegration', openRouterIntegrationInput());
    const state = await integrations.waitForItemCount(1);
    await ctx.close();
    expect(state.values()[0]?.provider).toBe('openrouter');
  });

  test('happy: backfill empty, hooks load empty state', async () => {
    const ctx = await buildRealtimeContext({});
    const integrations = await ctx.realtime.renderHook(useIntegrations);
    const state = await integrations.waitForStatus('ready');
    await ctx.close();
    expect(state.entries()).toEqual([]);
  });

  test('happy: updates integrations through daemon events', async () => {
    const ctx = await buildRealtimeContext({});
    const integrations = await ctx.realtime.renderHook(useIntegrations);
    const created = await ctx.daemon.do('createIntegration', emptyAnthropicIntegrationInput());
    await ctx.daemon.do('updateIntegration', updatedAnthropicIntegrationInput(created.id));
    const state = await integrations.waitForItemCount(1);
    await ctx.close();
    expect(state.getItem(created.id)?.value).toMatchObject({ data: { apiKey: 'sk-test' }, name: 'Claude' });
  });

  test('happy: deletes integrations through daemon events', async () => {
    const ctx = await buildRealtimeContext({});
    const integrations = await ctx.realtime.renderHook(useIntegrations);
    const created = await ctx.daemon.do('createIntegration', openRouterIntegrationInput());
    await ctx.daemon.do('deleteIntegration', { id: created.id });
    const state = await integrations.waitForItemCount(0);
    await ctx.close();
    expect(state.entries()).toEqual([]);
  });
});
