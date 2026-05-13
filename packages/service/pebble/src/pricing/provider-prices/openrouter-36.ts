// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart36(calculator: PriceCalculator) {
  // Qwen: Qwen3 30B A3B
  calculator.registerPricing('openrouter/qwen/qwen3-30b-a3b', {
    inputTokensReadUncachedPPM: 0.09,
    outputTokensGeneratedPPM: 0.45,
  });
  // Qwen: Qwen3 30B A3B Instruct 2507
  calculator.registerPricing('openrouter/qwen/qwen3-30b-a3b-instruct-2507', {
    inputTokensReadUncachedPPM: 0.09,
    outputTokensGeneratedPPM: 0.3,
  });
  // Qwen: Qwen3 30B A3B Thinking 2507
  calculator.registerPricing('openrouter/qwen/qwen3-30b-a3b-thinking-2507', {
    inputTokensReadUncachedPPM: 0.08,
    inputTokensReadCachedPPM: 0.08,
    outputTokensGeneratedPPM: 0.4,
  });
  // Qwen: Qwen3 32B
  calculator.registerPricing('openrouter/qwen/qwen3-32b', {
    inputTokensReadUncachedPPM: 0.08,
    outputTokensGeneratedPPM: 0.28,
  });
  // Qwen: Qwen3 8B
  calculator.registerPricing('openrouter/qwen/qwen3-8b', {
    inputTokensReadUncachedPPM: 0.05,
    inputTokensReadCachedPPM: 0.05,
    outputTokensGeneratedPPM: 0.4,
  });
  // Qwen: Qwen3 Coder 480B A35B
  calculator.registerPricing('openrouter/qwen/qwen3-coder', {
    inputTokensReadUncachedPPM: 0.22,
    outputTokensGeneratedPPM: 1.8,
  });
  // Qwen: Qwen3 Coder 30B A3B Instruct
  calculator.registerPricing('openrouter/qwen/qwen3-coder-30b-a3b-instruct', {
    inputTokensReadUncachedPPM: 0.07,
    outputTokensGeneratedPPM: 0.27,
  });
  // Qwen: Qwen3 Coder Flash
  calculator.registerPricing('openrouter/qwen/qwen3-coder-flash', {
    inputTokensReadUncachedPPM: 0.195,
    inputTokensReadCachedPPM: 0.039,
    inputTokensWriteCachedPPM: 0.24375,
    outputTokensGeneratedPPM: 0.975,
  });
}
