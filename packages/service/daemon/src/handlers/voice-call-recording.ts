import type { Datastore } from '@two-pebble/datastore';
import type { PricingLineItem } from '@two-pebble/pebble';
import type { DaemonEventSink } from '../types';

const VOICE_AGENT_ID = '';

interface RecordVoiceCallInput {
  datastore: Datastore;
  events: DaemonEventSink;
  inferenceProfileId: string;
  integrationId: string;
  kind: 'transcription' | 'speech';
  prices: PricingLineItem[];
  promptLabel: string;
  promptText: string;
  responseLabel: string;
  responseText: string;
}

/**
 * Persists a transcription or speech call as a synthetic two-cell thread plus
 * any price line items reported by the provider. The thread has no agent
 * attached so it shows up under the "Other" bucket on the debug threads page.
 */
export async function recordVoiceCall(input: RecordVoiceCallInput): Promise<string> {
  const threadId = `voice-${input.kind}-${crypto.randomUUID()}`;
  await input.datastore.agent.conversationCells.record({
    agentId: VOICE_AGENT_ID,
    orderId: 0,
    content: [{ type: 'text', content: { text: input.promptText } }],
    label: input.promptLabel,
    role: 'user',
    threadId,
  });
  await input.datastore.agent.conversationCells.record({
    agentId: VOICE_AGENT_ID,
    orderId: 1,
    content: [{ type: 'text', content: { text: input.responseText } }],
    label: input.responseLabel,
    role: 'assistant',
    threadId,
  });
  for (const lineItem of input.prices) {
    const record = await input.datastore.agent.priceLineItems.record({
      agentId: VOICE_AGENT_ID,
      modelCallId: null,
      inferenceProfileId: input.inferenceProfileId,
      integrationId: input.integrationId,
      provider: lineItem.provider,
      modelId: lineItem.modelId,
      modelVariantId: lineItem.modelVariantId ?? null,
      charge: lineItem.charge,
      price: lineItem.price,
      quantity: lineItem.quantity,
      timestamp: lineItem.timestamp,
      total: lineItem.total,
    });
    input.events.emit('agentPriceLineItemRecorded', record);
  }
  return threadId;
}
