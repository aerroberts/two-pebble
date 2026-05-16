import { emptyAgentSystemPrompt } from '@two-pebble/datatypes';
import { agentCreateInput, modelCallRecordInput, openAiIntegrationInput } from '../../testing/support/test-inputs';
import type { RealtimeContext } from '../../testing/types';

export async function backfillModelCall(ctx: RealtimeContext) {
  const agent = await ctx.daemon.backfill('createAgent', agentCreateInput());
  const modelCall = await ctx.daemon.backfill('recordAgentCall', modelCallRecordInput(agent.id));
  return { agent, modelCall };
}

export async function launchPricedAgent(ctx: RealtimeContext) {
  const restoreFetch = installPriceProviderFetchForTesting();

  try {
    const integration = await ctx.daemon.do('createIntegration', openAiIntegrationInput());
    const profile = await ctx.daemon.do('createInferenceProfile', {
      data: { model: 'gpt-5.2' },
      integrationId: integration.id,
      kind: 'intelligence',
      name: 'OpenAI GPT',
      provider: 'openai',
    });
    const registry = await ctx.daemon.do('createAgentRegistry', {
      inferenceProfileId: profile.id,
      name: 'Price Test Agent',
      systemPrompt: emptyAgentSystemPrompt(),
    });
    const agent = await ctx.daemon.do('launchAgent', {
      agentRegistryId: registry.id,
      message: 'hello from price test',
    });
    return { agent };
  } finally {
    restoreFetch();
  }
}

function installPriceProviderFetchForTesting() {
  const originalFetch = global.fetch;
  const providerFetch = Object.assign(
    async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'hello from provider fetch test' } }],
          usage: {
            completion_tokens: 7,
            completion_tokens_details: { reasoning_tokens: 2 },
            prompt_tokens: 11,
            prompt_tokens_details: { cached_tokens: 3 },
          },
        }),
      ),
    { preconnect: originalFetch.preconnect },
  );
  global.fetch = providerFetch;
  return () => {
    global.fetch = originalFetch;
  };
}
