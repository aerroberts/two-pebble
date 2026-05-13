// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart43(calculator: PriceCalculator) {
  // xAI: Grok 3
  calculator.registerPricing('openrouter/x-ai/grok-3', {
    inputTokensReadUncachedPPM: 3,
    inputTokensReadCachedPPM: 0.75,
    outputTokensGeneratedPPM: 15,
  });
  // xAI: Grok 3 Beta
  calculator.registerPricing('openrouter/x-ai/grok-3-beta', {
    inputTokensReadUncachedPPM: 3,
    inputTokensReadCachedPPM: 0.75,
    outputTokensGeneratedPPM: 15,
  });
  // xAI: Grok 3 Mini
  calculator.registerPricing('openrouter/x-ai/grok-3-mini', {
    inputTokensReadUncachedPPM: 0.3,
    inputTokensReadCachedPPM: 0.075,
    outputTokensGeneratedPPM: 0.5,
  });
  // xAI: Grok 3 Mini Beta
  calculator.registerPricing('openrouter/x-ai/grok-3-mini-beta', {
    inputTokensReadUncachedPPM: 0.3,
    inputTokensReadCachedPPM: 0.075,
    outputTokensGeneratedPPM: 0.5,
  });
  // xAI: Grok 4
  calculator.registerPricing('openrouter/x-ai/grok-4', {
    inputTokensReadUncachedPPM: 3,
    inputTokensReadCachedPPM: 0.75,
    outputTokensGeneratedPPM: 15,
  });
  // xAI: Grok 4 Fast
  calculator.registerPricing('openrouter/x-ai/grok-4-fast', {
    inputTokensReadUncachedPPM: 0.2,
    inputTokensReadCachedPPM: 0.05,
    outputTokensGeneratedPPM: 0.5,
  });
  // xAI: Grok 4.1 Fast
  calculator.registerPricing('openrouter/x-ai/grok-4.1-fast', {
    inputTokensReadUncachedPPM: 0.2,
    inputTokensReadCachedPPM: 0.05,
    outputTokensGeneratedPPM: 0.5,
  });
  // xAI: Grok 4.20
  calculator.registerPricing('openrouter/x-ai/grok-4.20', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.2,
    outputTokensGeneratedPPM: 2.5,
  });
}
