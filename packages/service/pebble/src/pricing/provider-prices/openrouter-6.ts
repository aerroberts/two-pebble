// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart6(calculator: PriceCalculator) {
  // Arcee AI: Trinity Mini
  calculator.registerPricing('openrouter/arcee-ai/trinity-mini', {
    inputTokensReadUncachedPPM: 0.045,
    outputTokensGeneratedPPM: 0.15,
  });
  // Arcee AI: Virtuoso Large
  calculator.registerPricing('openrouter/arcee-ai/virtuoso-large', {
    inputTokensReadUncachedPPM: 0.75,
    outputTokensGeneratedPPM: 1.2,
  });
  // Baidu Qianfan: CoBuddy (free)
  calculator.registerPricing('openrouter/baidu/cobuddy:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Baidu: ERNIE 4.5 21B A3B
  calculator.registerPricing('openrouter/baidu/ernie-4.5-21b-a3b', {
    inputTokensReadUncachedPPM: 0.07,
    outputTokensGeneratedPPM: 0.28,
  });
  // Baidu: ERNIE 4.5 21B A3B Thinking
  calculator.registerPricing('openrouter/baidu/ernie-4.5-21b-a3b-thinking', {
    inputTokensReadUncachedPPM: 0.07,
    outputTokensGeneratedPPM: 0.28,
  });
  // Baidu: ERNIE 4.5 300B A47B
  calculator.registerPricing('openrouter/baidu/ernie-4.5-300b-a47b', {
    inputTokensReadUncachedPPM: 0.28,
    outputTokensGeneratedPPM: 1.1,
  });
  // Baidu: ERNIE 4.5 VL 28B A3B
  calculator.registerPricing('openrouter/baidu/ernie-4.5-vl-28b-a3b', {
    inputTokensReadUncachedPPM: 0.14,
    outputTokensGeneratedPPM: 0.56,
  });
  // Baidu: ERNIE 4.5 VL 424B A47B
  calculator.registerPricing('openrouter/baidu/ernie-4.5-vl-424b-a47b', {
    inputTokensReadUncachedPPM: 0.42,
    outputTokensGeneratedPPM: 1.25,
  });
}
