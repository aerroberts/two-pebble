// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart13(calculator: PriceCalculator) {
  // Google: Gemma 4 26B A4B  (free)
  calculator.registerPricing('openrouter/google/gemma-4-26b-a4b-it:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Google: Gemma 4 31B
  calculator.registerPricing('openrouter/google/gemma-4-31b-it', {
    inputTokensReadUncachedPPM: 0.13,
    outputTokensGeneratedPPM: 0.38,
  });
  // Google: Gemma 4 31B (free)
  calculator.registerPricing('openrouter/google/gemma-4-31b-it:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Google: Lyria 3 Clip Preview
  calculator.registerPricing('openrouter/google/lyria-3-clip-preview', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Google: Lyria 3 Pro Preview
  calculator.registerPricing('openrouter/google/lyria-3-pro-preview', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // MythoMax 13B
  calculator.registerPricing('openrouter/gryphe/mythomax-l2-13b', {
    inputTokensReadUncachedPPM: 0.06,
    outputTokensGeneratedPPM: 0.06,
  });
  // IBM: Granite 4.0 Micro
  calculator.registerPricing('openrouter/ibm-granite/granite-4.0-h-micro', {
    inputTokensReadUncachedPPM: 0.017,
    outputTokensGeneratedPPM: 0.11,
  });
  // IBM: Granite 4.1 8B
  calculator.registerPricing('openrouter/ibm-granite/granite-4.1-8b', {
    inputTokensReadUncachedPPM: 0.05,
    inputTokensReadCachedPPM: 0.05,
    outputTokensGeneratedPPM: 0.1,
  });
}
