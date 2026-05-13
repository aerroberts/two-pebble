// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart37(calculator: PriceCalculator) {
  // Qwen: Qwen3 Coder Next
  calculator.registerPricing('openrouter/qwen/qwen3-coder-next', {
    inputTokensReadUncachedPPM: 0.11,
    inputTokensReadCachedPPM: 0.07,
    outputTokensGeneratedPPM: 0.8,
  });
  // Qwen: Qwen3 Coder Plus
  calculator.registerPricing('openrouter/qwen/qwen3-coder-plus', {
    inputTokensReadUncachedPPM: 0.65,
    inputTokensReadCachedPPM: 0.13,
    inputTokensWriteCachedPPM: 0.8125,
    outputTokensGeneratedPPM: 3.25,
  });
  // Qwen: Qwen3 Coder 480B A35B (free)
  calculator.registerPricing('openrouter/qwen/qwen3-coder:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Qwen: Qwen3 Max
  calculator.registerPricing('openrouter/qwen/qwen3-max', {
    inputTokensReadUncachedPPM: 0.78,
    inputTokensReadCachedPPM: 0.156,
    inputTokensWriteCachedPPM: 0.975,
    outputTokensGeneratedPPM: 3.9,
  });
  // Qwen: Qwen3 Max Thinking
  calculator.registerPricing('openrouter/qwen/qwen3-max-thinking', {
    inputTokensReadUncachedPPM: 0.78,
    outputTokensGeneratedPPM: 3.9,
  });
  // Qwen: Qwen3 Next 80B A3B Instruct
  calculator.registerPricing('openrouter/qwen/qwen3-next-80b-a3b-instruct', {
    inputTokensReadUncachedPPM: 0.09,
    outputTokensGeneratedPPM: 1.1,
  });
  // Qwen: Qwen3 Next 80B A3B Instruct (free)
  calculator.registerPricing('openrouter/qwen/qwen3-next-80b-a3b-instruct:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Qwen: Qwen3 Next 80B A3B Thinking
  calculator.registerPricing('openrouter/qwen/qwen3-next-80b-a3b-thinking', {
    inputTokensReadUncachedPPM: 0.0975,
    outputTokensGeneratedPPM: 0.78,
  });
}
