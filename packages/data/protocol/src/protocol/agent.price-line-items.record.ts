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
