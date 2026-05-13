import type { useDatastoreForTesting } from './datastore-test-env';

type TestingDatastore = Awaited<ReturnType<typeof useDatastoreForTesting>>;

export interface PriceLineItemTestContext {
  agentId: string;
  callId: string;
  datastore: TestingDatastore;
}

export interface PriceLineItemRecordContext {
  agentId: string;
  callId: string;
}

export async function recordPriceLineItem(context: PriceLineItemTestContext) {
  const written = await context.datastore.agent.priceLineItems.record(priceLineItemRecord(context));
  return { ...written };
}

export function priceLineItemRecord(context: PriceLineItemRecordContext) {
  return {
    agentId: context.agentId,
    modelCallId: context.callId,
    inferenceProfileId: 'profile-test',
    integrationId: 'integration-test',
    provider: 'openai',
    modelId: 'gpt-5.2',
    modelVariantId: 'base',
    charge: 'input-tokens-read-uncached',
    price: 0.00000175,
    quantity: 100,
    timestamp: 123,
    total: 0.000175,
  };
}
