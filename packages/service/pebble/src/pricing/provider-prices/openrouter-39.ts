// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart39(calculator: PriceCalculator) {
  // Qwen: Qwen3.5-27B
  calculator.registerPricing('openrouter/qwen/qwen3.5-27b', {
    inputTokensReadUncachedPPM: 0.195,
    outputTokensGeneratedPPM: 1.56,
  });
  // Qwen: Qwen3.5-35B-A3B
  calculator.registerPricing('openrouter/qwen/qwen3.5-35b-a3b', {
    inputTokensReadUncachedPPM: 0.14,
    inputTokensReadCachedPPM: 0.05,
    outputTokensGeneratedPPM: 1,
  });
  // Qwen: Qwen3.5 397B A17B
  calculator.registerPricing('openrouter/qwen/qwen3.5-397b-a17b', {
    inputTokensReadUncachedPPM: 0.39,
    inputTokensReadCachedPPM: 0.195,
    outputTokensGeneratedPPM: 2.34,
  });
  // Qwen: Qwen3.5-9B
  calculator.registerPricing('openrouter/qwen/qwen3.5-9b', {
    inputTokensReadUncachedPPM: 0.04,
    outputTokensGeneratedPPM: 0.15,
  });
  // Qwen: Qwen3.5-Flash
  calculator.registerPricing('openrouter/qwen/qwen3.5-flash-02-23', {
    inputTokensReadUncachedPPM: 0.065,
    inputTokensWriteCachedPPM: 0.08125,
    outputTokensGeneratedPPM: 0.26,
  });
  // Qwen: Qwen3.5 Plus 2026-02-15
  calculator.registerPricing('openrouter/qwen/qwen3.5-plus-02-15', {
    inputTokensReadUncachedPPM: 0.26,
    inputTokensWriteCachedPPM: 0.325,
    outputTokensGeneratedPPM: 1.56,
  });
  // Qwen: Qwen3.5 Plus 2026-04-20
  calculator.registerPricing('openrouter/qwen/qwen3.5-plus-20260420', {
    inputTokensReadUncachedPPM: 0.4,
    outputTokensGeneratedPPM: 2.4,
  });
  // Qwen: Qwen3.6 27B
  calculator.registerPricing('openrouter/qwen/qwen3.6-27b', {
    inputTokensReadUncachedPPM: 0.32,
    outputTokensGeneratedPPM: 3.2,
  });
}
