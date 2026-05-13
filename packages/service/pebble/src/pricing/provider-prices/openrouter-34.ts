// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart34(calculator: PriceCalculator) {
  // Prime Intellect: INTELLECT-3
  calculator.registerPricing('openrouter/prime-intellect/intellect-3', {
    inputTokensReadUncachedPPM: 0.2,
    outputTokensGeneratedPPM: 1.1,
  });
  // Qwen2.5 72B Instruct
  calculator.registerPricing('openrouter/qwen/qwen-2.5-72b-instruct', {
    inputTokensReadUncachedPPM: 0.36,
    outputTokensGeneratedPPM: 0.4,
  });
  // Qwen: Qwen2.5 7B Instruct
  calculator.registerPricing('openrouter/qwen/qwen-2.5-7b-instruct', {
    inputTokensReadUncachedPPM: 0.04,
    outputTokensGeneratedPPM: 0.1,
  });
  // Qwen2.5 Coder 32B Instruct
  calculator.registerPricing('openrouter/qwen/qwen-2.5-coder-32b-instruct', {
    inputTokensReadUncachedPPM: 0.66,
    outputTokensGeneratedPPM: 1,
  });
  // Qwen: Qwen-Max
  calculator.registerPricing('openrouter/qwen/qwen-max', {
    inputTokensReadUncachedPPM: 1.04,
    inputTokensReadCachedPPM: 0.208,
    outputTokensGeneratedPPM: 4.16,
  });
  // Qwen: Qwen-Plus
  calculator.registerPricing('openrouter/qwen/qwen-plus', {
    inputTokensReadUncachedPPM: 0.26,
    inputTokensReadCachedPPM: 0.052,
    inputTokensWriteCachedPPM: 0.325,
    outputTokensGeneratedPPM: 0.78,
  });
  // Qwen: Qwen Plus 0728
  calculator.registerPricing('openrouter/qwen/qwen-plus-2025-07-28', {
    inputTokensReadUncachedPPM: 0.26,
    inputTokensWriteCachedPPM: 0.325,
    outputTokensGeneratedPPM: 0.78,
  });
  // Qwen: Qwen Plus 0728 (thinking)
  calculator.registerPricing('openrouter/qwen/qwen-plus-2025-07-28:thinking', {
    inputTokensReadUncachedPPM: 0.26,
    inputTokensWriteCachedPPM: 0.325,
    outputTokensGeneratedPPM: 0.78,
  });
}
