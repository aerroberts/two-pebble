export interface InferenceProfile_Anthropic {
  provider: 'anthropic';
  kind: 'intelligence';
  integrationId: string;
  data: {
    model: string;
    thinkingBudget: number;
  };
}
