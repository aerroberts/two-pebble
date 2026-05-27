export interface Integration_Github {
  provider: 'github';
  data: {
    apiKey: string;
    repositories?: string[];
  };
}
