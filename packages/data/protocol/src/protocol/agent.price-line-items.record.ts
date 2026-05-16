/**
 * Defines the AgentPriceLineItemsRecordOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface AgentPriceLineItemsRecordOperation {
  name: 'recordAgentPriceLineItem';
  request: {
    agentId: string;
    modelCallId: string | null;
    inferenceProfileId?: string | null;
    integrationId?: string | null;
    provider: string;
    modelId: string;
    modelVariantId?: string | null;
    charge: string;
    price: number;
    quantity: number;
    timestamp?: number;
    total: number;
  };
  response: {
    id: string;
  };
}
