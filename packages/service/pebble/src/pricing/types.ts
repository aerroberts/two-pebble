export interface PricingLineItem {
  provider: string;
  modelId: string;
  modelVariantId?: string;
  charge: string;
  quantity: number;
  price: number;
  timestamp: number;
  total: number;
}

export interface UsageReport {
  provider: string;
  modelId: string;
  usage: ModelUsage;
}

export type PricingLineItems = PricingLineItem[];

export interface StaticPricing {
  inputTokensReadUncachedPPM?: number;
  inputTokensReadCachedPPM?: number;
  inputTokensWriteCachedPPM?: number;
  outputTokensGeneratedPPM?: number;
  inputTokensTier?: number;
}

export interface ModelUsage {
  inputTokensReadUncached?: number;
  inputTokensReadCached?: number;
  inputTokensWriteCached?: number;
  outputTokensGenerated?: number;
  outputTokensThinking?: number;
}
