import { emptyAgentSystemPrompt } from '@two-pebble/datatypes';
import type { CreateInferenceProfileInput } from '../../states/inference-profiles/types';
import type { CreateIntegrationInput, UpdateIntegrationInput } from '../../states/integrations/types';
import type { RealtimeDaemonDriver } from '../realtime-daemon-driver';
import type {
  AgentCreateTestInput,
  MaybeAgentId,
  ModelCallRecordTestInput,
  PriceLineItemRecordTestInput,
  TraceRecordTestInput,
} from './types';

export function agentCreateInput(): AgentCreateTestInput {
  return {
    description: 'Realtime test agent',
    name: 'Realtime Agent',
    projectId: 'proj_default',
  };
}

export function modelCallRecordInput(agentId: MaybeAgentId): ModelCallRecordTestInput {
  const startedAt = Date.now();
  return {
    agentId,
    completedAt: startedAt + 10,
    data: { tokens: 42 },
    errorMessage: '',
    id: crypto.randomUUID(),
    modelId: 'gpt-test',
    provider: 'openai',
    startedAt,
    status: 'completed' as const,
    threadCellPointer: 'thread-realtime:1',
  };
}

export function priceLineItemRecordInput(agentId: string, modelCallId: string): PriceLineItemRecordTestInput {
  return {
    agentId,
    modelCallId,
    inferenceProfileId: null,
    integrationId: null,
    provider: 'openai',
    modelId: 'gpt-test',
    modelVariantId: null,
    charge: 'input-tokens-read-uncached',
    price: 0.1,
    quantity: 42,
    timestamp: Date.now(),
    total: 4.2,
  };
}

export function traceRecordInput(agentId: string): TraceRecordTestInput {
  return {
    agentId,
    data: { content: [{ type: 'text' as const, content: { text: 'Realtime trace message' } }] },
    id: crypto.randomUUID(),
    orderId: 1,
    type: 'user-message',
  };
}

export function anthropicIntegrationInput(): CreateIntegrationInput {
  return { data: { apiKey: 'sk-test' }, name: 'Anthropic', provider: 'anthropic' };
}

export function emptyAnthropicIntegrationInput(): CreateIntegrationInput {
  return { data: { apiKey: '' }, name: '', provider: 'anthropic' };
}

export function openAiIntegrationInput(): CreateIntegrationInput {
  return { data: { apiKey: 'sk-test' }, name: 'OpenAI', provider: 'openai' };
}

export function openAiInferenceProfileInput(integrationId: string): CreateInferenceProfileInput {
  return { data: { model: 'gpt-test' }, integrationId, kind: 'intelligence', name: 'OpenAI GPT', provider: 'openai' };
}

export function helloWorldAgentRegistryInput(inferenceProfileId: string) {
  return {
    inferenceProfileId,
    name: 'Hello World Agent',
    systemPrompt: emptyAgentSystemPrompt(),
  };
}

/**
 * Provisions an OpenAI integration, profile, and agent registry through the
 * daemon and returns the resulting registry id. Tests use this so launching
 * an agent stays a single line in the test body.
 */
export async function setupOpenAiAgentRegistry(daemon: RealtimeDaemonDriver) {
  const integration = await daemon.do('createIntegration', openAiIntegrationInput());
  const profile = await daemon.do('createInferenceProfile', openAiInferenceProfileInput(integration.id));
  return daemon.do('createAgentRegistry', helloWorldAgentRegistryInput(profile.id));
}

export function openRouterIntegrationInput(): CreateIntegrationInput {
  return { data: { apiKey: 'sk-test' }, name: 'OpenRouter', provider: 'openrouter' };
}

export function updatedAnthropicIntegrationInput(id: string): UpdateIntegrationInput {
  return { data: { apiKey: 'sk-test' }, id, name: 'Claude', provider: 'anthropic' };
}
