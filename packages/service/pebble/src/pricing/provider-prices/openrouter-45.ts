// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart45(calculator: PriceCalculator) {
  // Z.ai: GLM 4 32B
  calculator.registerPricing('openrouter/z-ai/glm-4-32b', {
    inputTokensReadUncachedPPM: 0.1,
    outputTokensGeneratedPPM: 0.1,
  });
  // Z.ai: GLM 4.5
  calculator.registerPricing('openrouter/z-ai/glm-4.5', {
    inputTokensReadUncachedPPM: 0.6,
    inputTokensReadCachedPPM: 0.11,
    outputTokensGeneratedPPM: 2.2,
  });
  // Z.ai: GLM 4.5 Air
  calculator.registerPricing('openrouter/z-ai/glm-4.5-air', {
    inputTokensReadUncachedPPM: 0.13,
    inputTokensReadCachedPPM: 0.025,
    outputTokensGeneratedPPM: 0.85,
  });
  // Z.ai: GLM 4.5 Air (free)
  calculator.registerPricing('openrouter/z-ai/glm-4.5-air:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Z.ai: GLM 4.5V
  calculator.registerPricing('openrouter/z-ai/glm-4.5v', {
    inputTokensReadUncachedPPM: 0.6,
    inputTokensReadCachedPPM: 0.11,
    outputTokensGeneratedPPM: 1.8,
  });
  // Z.ai: GLM 4.6
  calculator.registerPricing('openrouter/z-ai/glm-4.6', {
    inputTokensReadUncachedPPM: 0.39,
    outputTokensGeneratedPPM: 1.9,
  });
  // Z.ai: GLM 4.6V
  calculator.registerPricing('openrouter/z-ai/glm-4.6v', {
    inputTokensReadUncachedPPM: 0.3,
    inputTokensReadCachedPPM: 0.05,
    outputTokensGeneratedPPM: 0.9,
  });
  // Z.ai: GLM 4.7
  calculator.registerPricing('openrouter/z-ai/glm-4.7', {
    inputTokensReadUncachedPPM: 0.4,
    inputTokensReadCachedPPM: 0.08,
    outputTokensGeneratedPPM: 1.75,
  });
}
