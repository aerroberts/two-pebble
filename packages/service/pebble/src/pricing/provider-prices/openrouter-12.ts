// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart12(calculator: PriceCalculator) {
  // Google: Gemini 3.1 Pro Preview
  calculator.registerPricing('openrouter/google/gemini-3.1-pro-preview', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.2,
    inputTokensWriteCachedPPM: 0.375,
    outputTokensGeneratedPPM: 12,
  });
  // Google: Gemini 3.1 Pro Preview Custom Tools
  calculator.registerPricing('openrouter/google/gemini-3.1-pro-preview-customtools', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.2,
    inputTokensWriteCachedPPM: 0.375,
    outputTokensGeneratedPPM: 12,
  });
  // Google: Gemma 2 27B
  calculator.registerPricing('openrouter/google/gemma-2-27b-it', {
    inputTokensReadUncachedPPM: 0.65,
    outputTokensGeneratedPPM: 0.65,
  });
  // Google: Gemma 3 12B
  calculator.registerPricing('openrouter/google/gemma-3-12b-it', {
    inputTokensReadUncachedPPM: 0.04,
    outputTokensGeneratedPPM: 0.13,
  });
  // Google: Gemma 3 27B
  calculator.registerPricing('openrouter/google/gemma-3-27b-it', {
    inputTokensReadUncachedPPM: 0.08,
    outputTokensGeneratedPPM: 0.16,
  });
  // Google: Gemma 3 4B
  calculator.registerPricing('openrouter/google/gemma-3-4b-it', {
    inputTokensReadUncachedPPM: 0.04,
    outputTokensGeneratedPPM: 0.08,
  });
  // Google: Gemma 3n 4B
  calculator.registerPricing('openrouter/google/gemma-3n-e4b-it', {
    inputTokensReadUncachedPPM: 0.06,
    outputTokensGeneratedPPM: 0.12,
  });
  // Google: Gemma 4 26B A4B
  calculator.registerPricing('openrouter/google/gemma-4-26b-a4b-it', {
    inputTokensReadUncachedPPM: 0.06,
    outputTokensGeneratedPPM: 0.33,
  });
}
