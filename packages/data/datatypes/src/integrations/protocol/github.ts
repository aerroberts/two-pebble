export interface Integration_Github {
  provider: 'github';
  data: {
    token: string;
    repos?: string[];
  };
}
