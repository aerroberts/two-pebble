// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart38(calculator: PriceCalculator) {
  // Qwen: Qwen3 VL 235B A22B Instruct
  calculator.registerPricing('openrouter/qwen/qwen3-vl-235b-a22b-instruct', {
    inputTokensReadUncachedPPM: 0.2,
    inputTokensReadCachedPPM: 0.11,
    outputTokensGeneratedPPM: 0.88,
  });
  // Qwen: Qwen3 VL 235B A22B Thinking
  calculator.registerPricing('openrouter/qwen/qwen3-vl-235b-a22b-thinking', {
    inputTokensReadUncachedPPM: 0.26,
    outputTokensGeneratedPPM: 2.6,
  });
  // Qwen: Qwen3 VL 30B A3B Instruct
  calculator.registerPricing('openrouter/qwen/qwen3-vl-30b-a3b-instruct', {
    inputTokensReadUncachedPPM: 0.13,
    outputTokensGeneratedPPM: 0.52,
  });
  // Qwen: Qwen3 VL 30B A3B Thinking
  calculator.registerPricing('openrouter/qwen/qwen3-vl-30b-a3b-thinking', {
    inputTokensReadUncachedPPM: 0.13,
    outputTokensGeneratedPPM: 1.56,
  });
  // Qwen: Qwen3 VL 32B Instruct
  calculator.registerPricing('openrouter/qwen/qwen3-vl-32b-instruct', {
    inputTokensReadUncachedPPM: 0.104,
    outputTokensGeneratedPPM: 0.416,
  });
  // Qwen: Qwen3 VL 8B Instruct
  calculator.registerPricing('openrouter/qwen/qwen3-vl-8b-instruct', {
    inputTokensReadUncachedPPM: 0.08,
    outputTokensGeneratedPPM: 0.5,
  });
  // Qwen: Qwen3 VL 8B Thinking
  calculator.registerPricing('openrouter/qwen/qwen3-vl-8b-thinking', {
    inputTokensReadUncachedPPM: 0.117,
    outputTokensGeneratedPPM: 1.365,
  });
  // Qwen: Qwen3.5-122B-A10B
  calculator.registerPricing('openrouter/qwen/qwen3.5-122b-a10b', {
    inputTokensReadUncachedPPM: 0.26,
    outputTokensGeneratedPPM: 2.08,
  });
}
