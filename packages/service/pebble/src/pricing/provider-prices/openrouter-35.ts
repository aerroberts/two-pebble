// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart35(calculator: PriceCalculator) {
  // Qwen: Qwen-Turbo
  calculator.registerPricing('openrouter/qwen/qwen-turbo', {
    inputTokensReadUncachedPPM: 0.0325,
    inputTokensReadCachedPPM: 0.0065,
    outputTokensGeneratedPPM: 0.13,
  });
  // Qwen: Qwen VL Max
  calculator.registerPricing('openrouter/qwen/qwen-vl-max', {
    inputTokensReadUncachedPPM: 0.52,
    outputTokensGeneratedPPM: 2.08,
  });
  // Qwen: Qwen VL Plus
  calculator.registerPricing('openrouter/qwen/qwen-vl-plus', {
    inputTokensReadUncachedPPM: 0.1365,
    inputTokensReadCachedPPM: 0.0273,
    outputTokensGeneratedPPM: 0.4095,
  });
  // Qwen: Qwen2.5 VL 72B Instruct
  calculator.registerPricing('openrouter/qwen/qwen2.5-vl-72b-instruct', {
    inputTokensReadUncachedPPM: 0.25,
    outputTokensGeneratedPPM: 0.75,
  });
  // Qwen: Qwen3 14B
  calculator.registerPricing('openrouter/qwen/qwen3-14b', {
    inputTokensReadUncachedPPM: 0.06,
    outputTokensGeneratedPPM: 0.24,
  });
  // Qwen: Qwen3 235B A22B
  calculator.registerPricing('openrouter/qwen/qwen3-235b-a22b', {
    inputTokensReadUncachedPPM: 0.455,
    outputTokensGeneratedPPM: 1.82,
  });
  // Qwen: Qwen3 235B A22B Instruct 2507
  calculator.registerPricing('openrouter/qwen/qwen3-235b-a22b-2507', {
    inputTokensReadUncachedPPM: 0.071,
    outputTokensGeneratedPPM: 0.1,
  });
  // Qwen: Qwen3 235B A22B Thinking 2507
  calculator.registerPricing('openrouter/qwen/qwen3-235b-a22b-thinking-2507', {
    inputTokensReadUncachedPPM: 0.1495,
    outputTokensGeneratedPPM: 1.495,
  });
}
