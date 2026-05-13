// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart19(calculator: PriceCalculator) {
  // Mistral: Ministral 3 14B 2512
  calculator.registerPricing('openrouter/mistralai/ministral-14b-2512', {
    inputTokensReadUncachedPPM: 0.2,
    inputTokensReadCachedPPM: 0.02,
    outputTokensGeneratedPPM: 0.2,
  });
  // Mistral: Ministral 3 3B 2512
  calculator.registerPricing('openrouter/mistralai/ministral-3b-2512', {
    inputTokensReadUncachedPPM: 0.1,
    inputTokensReadCachedPPM: 0.01,
    outputTokensGeneratedPPM: 0.1,
  });
  // Mistral: Ministral 3 8B 2512
  calculator.registerPricing('openrouter/mistralai/ministral-8b-2512', {
    inputTokensReadUncachedPPM: 0.15,
    inputTokensReadCachedPPM: 0.015,
    outputTokensGeneratedPPM: 0.15,
  });
  // Mistral: Mistral 7B Instruct v0.1
  calculator.registerPricing('openrouter/mistralai/mistral-7b-instruct-v0.1', {
    inputTokensReadUncachedPPM: 0.11,
    outputTokensGeneratedPPM: 0.19,
  });
  // Mistral Large
  calculator.registerPricing('openrouter/mistralai/mistral-large', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.2,
    outputTokensGeneratedPPM: 6,
  });
  // Mistral Large 2407
  calculator.registerPricing('openrouter/mistralai/mistral-large-2407', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.2,
    outputTokensGeneratedPPM: 6,
  });
  // Mistral Large 2411
  calculator.registerPricing('openrouter/mistralai/mistral-large-2411', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.2,
    outputTokensGeneratedPPM: 6,
  });
  // Mistral: Mistral Large 3 2512
  calculator.registerPricing('openrouter/mistralai/mistral-large-2512', {
    inputTokensReadUncachedPPM: 0.5,
    inputTokensReadCachedPPM: 0.05,
    outputTokensGeneratedPPM: 1.5,
  });
}
