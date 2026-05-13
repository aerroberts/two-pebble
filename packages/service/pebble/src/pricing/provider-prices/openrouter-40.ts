// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart40(calculator: PriceCalculator) {
  // Qwen: Qwen3.6 35B A3B
  calculator.registerPricing('openrouter/qwen/qwen3.6-35b-a3b', {
    inputTokensReadUncachedPPM: 0.15,
    inputTokensReadCachedPPM: 0.05,
    outputTokensGeneratedPPM: 1,
  });
  // Qwen: Qwen3.6 Flash
  calculator.registerPricing('openrouter/qwen/qwen3.6-flash', {
    inputTokensReadUncachedPPM: 0.25,
    inputTokensWriteCachedPPM: 0.3125,
    outputTokensGeneratedPPM: 1.5,
  });
  // Qwen: Qwen3.6 Max Preview
  calculator.registerPricing('openrouter/qwen/qwen3.6-max-preview', {
    inputTokensReadUncachedPPM: 1.04,
    inputTokensWriteCachedPPM: 1.3,
    outputTokensGeneratedPPM: 6.24,
  });
  // Qwen: Qwen3.6 Plus
  calculator.registerPricing('openrouter/qwen/qwen3.6-plus', {
    inputTokensReadUncachedPPM: 0.325,
    inputTokensWriteCachedPPM: 0.40625,
    outputTokensGeneratedPPM: 1.95,
  });
  // Reka Edge
  calculator.registerPricing('openrouter/rekaai/reka-edge', {
    inputTokensReadUncachedPPM: 0.1,
    outputTokensGeneratedPPM: 0.1,
  });
  // Reka Flash 3
  calculator.registerPricing('openrouter/rekaai/reka-flash-3', {
    inputTokensReadUncachedPPM: 0.1,
    outputTokensGeneratedPPM: 0.2,
  });
  // Relace: Relace Apply 3
  calculator.registerPricing('openrouter/relace/relace-apply-3', {
    inputTokensReadUncachedPPM: 0.85,
    outputTokensGeneratedPPM: 1.25,
  });
  // Relace: Relace Search
  calculator.registerPricing('openrouter/relace/relace-search', {
    inputTokensReadUncachedPPM: 1,
    outputTokensGeneratedPPM: 3,
  });
}
