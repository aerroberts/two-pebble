import { describe, expect, test } from 'bun:test';
import { useSendAssistantMessage } from '../../index';
import { buildRealtimeContext } from '../../testing/realtime-context.builder';
import { installProviderFetchForTesting } from '../../testing/support/provider-fetch';
import { setupOpenAiAgentRegistry } from '../../testing/support/test-inputs';

describe('feature: realtime assistant messages', () => {
  test('happy: relaunches the persisted assistant when it is offline', async () => {
    const restoreFetch = installProviderFetchForTesting();
    const ctx = await buildRealtimeContext({});
    try {
      const sendAssistantMessage = await ctx.realtime.renderHook(useSendAssistantMessage);
      const registry = await setupOpenAiAgentRegistry(ctx.daemon);
      const original = await ctx.daemon.do('launchAgent', {
        agentRegistryId: registry.id,
        message: 'hello from assistant test',
      });
      await ctx.setAgentStatus({ id: original.id, status: 'offline' });
      await ctx.daemon.do('updateAppSettings', {
        defaultTranscriptionProfileId: null,
        defaultSpeechProfileId: null,
        assistantAgentRegistryId: registry.id,
        assistantAgentId: original.id,
        assistantCommandKEnabled: true,
        assistantCommandKVoiceModeEnabled: false,
      });

      const result = await sendAssistantMessage.current()({ message: 'relaunch me' });

      const settings = await ctx.daemon.do('readAppSettings', {});
      expect(result?.launched).toBe(true);
      expect(result?.agentId).not.toBe(original.id);
      expect(settings.assistantAgentId).toBe(result?.agentId);
    } finally {
      await ctx.close();
      restoreFetch();
    }
  });
});
