// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart46(calculator: PriceCalculator) {
  // Z.ai: GLM 4.7 Flash
  calculator.registerPricing('openrouter/z-ai/glm-4.7-flash', {
    inputTokensReadUncachedPPM: 0.06,
    inputTokensReadCachedPPM: 0.01,
    outputTokensGeneratedPPM: 0.4,
  });
  // Z.ai: GLM 5
  calculator.registerPricing('openrouter/z-ai/glm-5', {
    inputTokensReadUncachedPPM: 0.6,
    inputTokensReadCachedPPM: 0.12,
    outputTokensGeneratedPPM: 1.92,
  });
  // Z.ai: GLM 5 Turbo
  calculator.registerPricing('openrouter/z-ai/glm-5-turbo', {
    inputTokensReadUncachedPPM: 1.2,
    inputTokensReadCachedPPM: 0.24,
    outputTokensGeneratedPPM: 4,
  });
  // Z.ai: GLM 5.1
  calculator.registerPricing('openrouter/z-ai/glm-5.1', {
    inputTokensReadUncachedPPM: 1.05,
    inputTokensReadCachedPPM: 0.525,
    outputTokensGeneratedPPM: 3.5,
  });
  // Z.ai: GLM 5V Turbo
  calculator.registerPricing('openrouter/z-ai/glm-5v-turbo', {
    inputTokensReadUncachedPPM: 1.2,
    inputTokensReadCachedPPM: 0.24,
    outputTokensGeneratedPPM: 4,
  });
}
