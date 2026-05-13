// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart9(calculator: PriceCalculator) {
  // DeepSeek: R1 0528
  calculator.registerPricing('openrouter/deepseek/deepseek-r1-0528', {
    inputTokensReadUncachedPPM: 0.5,
    inputTokensReadCachedPPM: 0.35,
    outputTokensGeneratedPPM: 2.15,
  });
  // DeepSeek: R1 Distill Llama 70B
  calculator.registerPricing('openrouter/deepseek/deepseek-r1-distill-llama-70b', {
    inputTokensReadUncachedPPM: 0.7,
    outputTokensGeneratedPPM: 0.8,
  });
  // DeepSeek: R1 Distill Qwen 32B
  calculator.registerPricing('openrouter/deepseek/deepseek-r1-distill-qwen-32b', {
    inputTokensReadUncachedPPM: 0.29,
    outputTokensGeneratedPPM: 0.29,
  });
  // DeepSeek: DeepSeek V3.1 Terminus
  calculator.registerPricing('openrouter/deepseek/deepseek-v3.1-terminus', {
    inputTokensReadUncachedPPM: 0.27,
    inputTokensReadCachedPPM: 0.13,
    outputTokensGeneratedPPM: 0.95,
  });
  // DeepSeek: DeepSeek V3.2
  calculator.registerPricing('openrouter/deepseek/deepseek-v3.2', {
    inputTokensReadUncachedPPM: 0.252,
    inputTokensReadCachedPPM: 0.0252,
    outputTokensGeneratedPPM: 0.378,
  });
  // DeepSeek: DeepSeek V3.2 Exp
  calculator.registerPricing('openrouter/deepseek/deepseek-v3.2-exp', {
    inputTokensReadUncachedPPM: 0.27,
    outputTokensGeneratedPPM: 0.41,
  });
  // DeepSeek: DeepSeek V3.2 Speciale
  calculator.registerPricing('openrouter/deepseek/deepseek-v3.2-speciale', {
    inputTokensReadUncachedPPM: 0.287,
    inputTokensReadCachedPPM: 0.058,
    outputTokensGeneratedPPM: 0.431,
  });
  // DeepSeek: DeepSeek V4 Flash
  calculator.registerPricing('openrouter/deepseek/deepseek-v4-flash', {
    inputTokensReadUncachedPPM: 0.14,
    inputTokensReadCachedPPM: 0.0028,
    outputTokensGeneratedPPM: 0.28,
  });
}
