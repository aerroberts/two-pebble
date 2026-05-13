// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart14(calculator: PriceCalculator) {
  // Inception: Mercury 2
  calculator.registerPricing('openrouter/inception/mercury-2', {
    inputTokensReadUncachedPPM: 0.25,
    inputTokensReadCachedPPM: 0.025,
    outputTokensGeneratedPPM: 0.75,
  });
  // inclusionAI: Ling-2.6-1T
  calculator.registerPricing('openrouter/inclusionai/ling-2.6-1t', {
    inputTokensReadUncachedPPM: 0.3,
    inputTokensReadCachedPPM: 0.06,
    outputTokensGeneratedPPM: 2.5,
  });
  // inclusionAI: Ling-2.6-flash
  calculator.registerPricing('openrouter/inclusionai/ling-2.6-flash', {
    inputTokensReadUncachedPPM: 0.08,
    inputTokensReadCachedPPM: 0.016,
    outputTokensGeneratedPPM: 0.24,
  });
  // inclusionAI: Ring-2.6-1T (free)
  calculator.registerPricing('openrouter/inclusionai/ring-2.6-1t:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Inflection: Inflection 3 Pi
  calculator.registerPricing('openrouter/inflection/inflection-3-pi', {
    inputTokensReadUncachedPPM: 2.5,
    outputTokensGeneratedPPM: 10,
  });
  // Inflection: Inflection 3 Productivity
  calculator.registerPricing('openrouter/inflection/inflection-3-productivity', {
    inputTokensReadUncachedPPM: 2.5,
    outputTokensGeneratedPPM: 10,
  });
  // Kwaipilot: KAT-Coder-Pro V2
  calculator.registerPricing('openrouter/kwaipilot/kat-coder-pro-v2', {
    inputTokensReadUncachedPPM: 0.3,
    inputTokensReadCachedPPM: 0.06,
    outputTokensGeneratedPPM: 1.2,
  });
  // LiquidAI: LFM2-24B-A2B
  calculator.registerPricing('openrouter/liquid/lfm-2-24b-a2b', {
    inputTokensReadUncachedPPM: 0.03,
    outputTokensGeneratedPPM: 0.12,
  });
}
