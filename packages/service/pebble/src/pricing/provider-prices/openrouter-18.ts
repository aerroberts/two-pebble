// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart18(calculator: PriceCalculator) {
  // MiniMax: MiniMax M2.1
  calculator.registerPricing('openrouter/minimax/minimax-m2.1', {
    inputTokensReadUncachedPPM: 0.29,
    inputTokensReadCachedPPM: 0.03,
    outputTokensGeneratedPPM: 0.95,
  });
  // MiniMax: MiniMax M2.5
  calculator.registerPricing('openrouter/minimax/minimax-m2.5', {
    inputTokensReadUncachedPPM: 0.15,
    outputTokensGeneratedPPM: 1.15,
  });
  // MiniMax: MiniMax M2.5 (free)
  calculator.registerPricing('openrouter/minimax/minimax-m2.5:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // MiniMax: MiniMax M2.7
  calculator.registerPricing('openrouter/minimax/minimax-m2.7', {
    inputTokensReadUncachedPPM: 0.299,
    outputTokensGeneratedPPM: 1.2,
  });
  // Mistral: Codestral 2508
  calculator.registerPricing('openrouter/mistralai/codestral-2508', {
    inputTokensReadUncachedPPM: 0.3,
    inputTokensReadCachedPPM: 0.03,
    outputTokensGeneratedPPM: 0.9,
  });
  // Mistral: Devstral 2 2512
  calculator.registerPricing('openrouter/mistralai/devstral-2512', {
    inputTokensReadUncachedPPM: 0.4,
    inputTokensReadCachedPPM: 0.04,
    outputTokensGeneratedPPM: 2,
  });
  // Mistral: Devstral Medium
  calculator.registerPricing('openrouter/mistralai/devstral-medium', {
    inputTokensReadUncachedPPM: 0.4,
    inputTokensReadCachedPPM: 0.04,
    outputTokensGeneratedPPM: 2,
  });
  // Mistral: Devstral Small 1.1
  calculator.registerPricing('openrouter/mistralai/devstral-small', {
    inputTokensReadUncachedPPM: 0.1,
    inputTokensReadCachedPPM: 0.01,
    outputTokensGeneratedPPM: 0.3,
  });
}
