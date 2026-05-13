export interface AgentPriceLineItemsListOperation {
  name: 'listAgentPriceLineItems';
  request: {
    agentId: string;
  };
  response: {
    items: {
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
    }[];
  };
}
