// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart20(calculator: PriceCalculator) {
  // Mistral: Mistral Medium 3
  calculator.registerPricing('openrouter/mistralai/mistral-medium-3', {
    inputTokensReadUncachedPPM: 0.4,
    inputTokensReadCachedPPM: 0.04,
    outputTokensGeneratedPPM: 2,
  });
  // Mistral: Mistral Medium 3.5
  calculator.registerPricing('openrouter/mistralai/mistral-medium-3-5', {
    inputTokensReadUncachedPPM: 1.5,
    outputTokensGeneratedPPM: 7.5,
  });
  // Mistral: Mistral Medium 3.1
  calculator.registerPricing('openrouter/mistralai/mistral-medium-3.1', {
    inputTokensReadUncachedPPM: 0.4,
    inputTokensReadCachedPPM: 0.04,
    outputTokensGeneratedPPM: 2,
  });
  // Mistral: Mistral Nemo
  calculator.registerPricing('openrouter/mistralai/mistral-nemo', {
    inputTokensReadUncachedPPM: 0.02,
    outputTokensGeneratedPPM: 0.03,
  });
  // Mistral: Saba
  calculator.registerPricing('openrouter/mistralai/mistral-saba', {
    inputTokensReadUncachedPPM: 0.2,
    inputTokensReadCachedPPM: 0.02,
    outputTokensGeneratedPPM: 0.6,
  });
  // Mistral: Mistral Small 3
  calculator.registerPricing('openrouter/mistralai/mistral-small-24b-instruct-2501', {
    inputTokensReadUncachedPPM: 0.05,
    outputTokensGeneratedPPM: 0.08,
  });
  // Mistral: Mistral Small 4
  calculator.registerPricing('openrouter/mistralai/mistral-small-2603', {
    inputTokensReadUncachedPPM: 0.15,
    inputTokensReadCachedPPM: 0.015,
    outputTokensGeneratedPPM: 0.6,
  });
  // Mistral: Mistral Small 3.1 24B
  calculator.registerPricing('openrouter/mistralai/mistral-small-3.1-24b-instruct', {
    inputTokensReadUncachedPPM: 0.35,
    outputTokensGeneratedPPM: 0.56,
  });
}
