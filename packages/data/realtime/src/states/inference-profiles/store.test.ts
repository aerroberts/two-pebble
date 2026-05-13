import { describe, expect, test } from 'bun:test';
import { useInferenceProfiles } from '../../index';
import { buildRealtimeContext } from '../../testing/realtime-context.builder';
import { openAiInferenceProfileInput, openAiIntegrationInput } from '../../testing/support/test-inputs';

describe('feature: realtime inference profiles', () => {
  test('happy: backfill, hooks load current state', async () => {
    const ctx = await buildRealtimeContext({});
    const integration = await ctx.daemon.backfill('createIntegration', openAiIntegrationInput());
    const created = await ctx.daemon.backfill('createInferenceProfile', openAiInferenceProfileInput(integration.id));
    const profiles = await ctx.realtime.renderHook(useInferenceProfiles);
    const state = await profiles.waitForItemCount(1);
    await ctx.close();
    expect(state.getItem(created.id)?.value?.name).toBe('OpenAI GPT');
  });

  test('happy: backfill + realtime, hooks load current state and realtime hook listens to state changes', async () => {
    const ctx = await buildRealtimeContext({});
    const integration = await ctx.daemon.backfill('createIntegration', openAiIntegrationInput());
    await ctx.daemon.backfill('createInferenceProfile', openAiInferenceProfileInput(integration.id));
    const profiles = await ctx.realtime.renderHook(useInferenceProfiles);
    await ctx.daemon.do('createInferenceProfile', openAiInferenceProfileInput(integration.id));
    const state = await profiles.waitForItemCount(2);
    await ctx.close();
    expect(state.values().map((profile) => profile.provider)).toEqual(['openai', 'openai']);
  });

  test('happy: realtime, hook listens to state changes', async () => {
    const ctx = await buildRealtimeContext({});
    const integration = await ctx.daemon.backfill('createIntegration', openAiIntegrationInput());
    const profiles = await ctx.realtime.renderHook(useInferenceProfiles);
    const created = await ctx.daemon.do('createInferenceProfile', openAiInferenceProfileInput(integration.id));
    const state = await profiles.waitForItemCount(1);
    await ctx.close();
    expect(state.getItem(created.id)?.value?.provider).toBe('openai');
  });

  test('happy: backfill empty, hooks load empty state', async () => {
    const ctx = await buildRealtimeContext({});
    const profiles = await ctx.realtime.renderHook(useInferenceProfiles);
    const state = await profiles.waitForStatus('ready');
    await ctx.close();
    expect(state.entries()).toEqual([]);
  });
});
