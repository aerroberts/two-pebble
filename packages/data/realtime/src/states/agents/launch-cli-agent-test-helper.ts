import { emptyAgentSystemPrompt } from '@two-pebble/datatypes';
import { useAgents } from '../../index';
import { buildRealtimeContext } from '../../testing/realtime-context.builder';
import { installProviderFetchForTesting } from '../../testing/support/provider-fetch';
import { openAiInferenceProfileInput, openAiIntegrationInput } from '../../testing/support/test-inputs';

type AgentNameResult = string | undefined;

/**
 * Launches the registered CLI sample agent and waits for success.
 * The helper owns realtime setup, provider fetch stubbing, and cleanup.
 * The returned name is the state value observed by the agents hook.
 */
export async function launchCliAgentAndReadName(): Promise<AgentNameResult> {
  const restoreFetch = installProviderFetchForTesting();
  const ctx = await buildRealtimeContext({});
  try {
    const agents = await ctx.realtime.renderHook(useAgents);
    const integration = await ctx.daemon.do('createIntegration', openAiIntegrationInput());
    const profile = await ctx.daemon.do('createInferenceProfile', openAiInferenceProfileInput(integration.id));
    const registry = await ctx.daemon.do('createAgentRegistry', {
      inferenceProfileId: profile.id,
      name: 'CLI Agent Test',
      systemPrompt: emptyAgentSystemPrompt(),
    });
    const launched = await ctx.daemon.do('launchAgent', {
      agentRegistryId: registry.id,
      message: 'hello from cli agent test',
    });
    const state = await agents.waitFor((value) => value.getItem(launched.id)?.value?.status === 'idle');
    return state.getItem(launched.id)?.value?.name;
  } finally {
    await ctx.close();
    restoreFetch();
  }
}
