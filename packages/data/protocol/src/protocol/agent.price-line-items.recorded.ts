export interface AgentPriceLineItemRecordedEvent {
  name: 'agentPriceLineItemRecorded';
  payload: {
    id: string;
    agentId: string;
    modelCallId: string | null;
    inferenceProfileId?: string;
    integrationId?: string;
    provider: string;
    modelId: string;
    modelVariantId?: string;
    charge: string;
    price: number;
    quantity: number;
    timestamp?: number;
    total: number;
  };
}
