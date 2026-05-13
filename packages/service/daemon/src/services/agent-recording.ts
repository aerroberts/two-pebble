import type { Datastore } from '@two-pebble/datastore';
import type { PricingLineItem } from '@two-pebble/pebble';
import type {
  RecordConversationCellInput,
  RecordModelCallInput,
  RecordPriceLineItemInput,
} from './agent-registry-types';

/**
 * Persists a model call along with its emitted price line items and
 * broadcasts both events. Single-purpose so the registry service can
 * route trace observers to one place rather than inlining the writes.
 */
export async function recordModelCall(datastore: Datastore, input: RecordModelCallInput): Promise<void> {
  const record = await datastore.agent.calls.record({
    agentId: input.agentId,
    completedAt: input.call.completedAt,
    data: input.call,
    errorMessage: input.call.error ?? '',
    id: input.call.id,
    modelId: input.call.modelId,
    provider: input.call.provider,
    startedAt: input.call.startedAt,
    status: input.call.status === 'success' ? 'completed' : 'failed',
    threadCellPointer: input.call.threadCellPointer,
  });
  for (const lineItem of input.call.prices) {
    const lineRecord = await datastore.agent.priceLineItems.record(
      buildLineItemPayload({
        agentId: input.agentId,
        modelCallId: input.call.id,
        inferenceProfileId: input.inferenceProfileId,
        integrationId: input.integrationId,
        lineItem,
      }),
    );
    input.bridge.emit('agentPriceLineItemRecorded', lineRecord);
  }
  input.bridge.emit('agentCallRecorded', record);
}

/**
 * Persists one conversation cell against its thread. No side bridge
 * emit: the cell flows out through the realtime store via the
 * datastore write itself.
 */
export async function recordConversationCell(datastore: Datastore, input: RecordConversationCellInput): Promise<void> {
  await datastore.agent.conversationCells.record({
    agentId: input.agentId,
    orderId: input.cell.orderId,
    content: input.cell.cells,
    label: input.cell.label,
    role: input.cell.role,
    threadId: input.cell.threadId,
  });
}

/**
 * Persists a standalone price line item not associated with a model
 * call (e.g., capability-emitted billing). Broadcasts on the same
 * realtime channel callers expect.
 */
export async function recordPriceLineItem(datastore: Datastore, input: RecordPriceLineItemInput): Promise<void> {
  const record = await datastore.agent.priceLineItems.record(
    buildLineItemPayload({
      agentId: input.agentId,
      modelCallId: null,
      inferenceProfileId: input.inferenceProfileId,
      integrationId: input.integrationId,
      lineItem: input.lineItem,
    }),
  );
  input.bridge.emit('agentPriceLineItemRecorded', record);
}

interface BuildLineItemPayloadInput {
  agentId: string;
  modelCallId: string | null;
  inferenceProfileId: string | undefined;
  integrationId: string | undefined;
  lineItem: PricingLineItem;
}

function buildLineItemPayload(input: BuildLineItemPayloadInput) {
  return {
    agentId: input.agentId,
    modelCallId: input.modelCallId,
    inferenceProfileId: input.inferenceProfileId ?? null,
    integrationId: input.integrationId ?? null,
    provider: input.lineItem.provider,
    modelId: input.lineItem.modelId,
    modelVariantId: input.lineItem.modelVariantId ?? null,
    charge: input.lineItem.charge,
    price: input.lineItem.price,
    quantity: input.lineItem.quantity,
    timestamp: input.lineItem.timestamp,
    total: input.lineItem.total,
  };
}
