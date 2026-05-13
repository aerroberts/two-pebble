// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart8(calculator: PriceCalculator) {
  // Cohere: Command R (08-2024)
  calculator.registerPricing('openrouter/cohere/command-r-08-2024', {
    inputTokensReadUncachedPPM: 0.15,
    outputTokensGeneratedPPM: 0.6,
  });
  // Cohere: Command R+ (08-2024)
  calculator.registerPricing('openrouter/cohere/command-r-plus-08-2024', {
    inputTokensReadUncachedPPM: 2.5,
    outputTokensGeneratedPPM: 10,
  });
  // Cohere: Command R7B (12-2024)
  calculator.registerPricing('openrouter/cohere/command-r7b-12-2024', {
    inputTokensReadUncachedPPM: 0.0375,
    outputTokensGeneratedPPM: 0.15,
  });
  // Deep Cogito: Cogito v2.1 671B
  calculator.registerPricing('openrouter/deepcogito/cogito-v2.1-671b', {
    inputTokensReadUncachedPPM: 1.25,
    outputTokensGeneratedPPM: 1.25,
  });
  // DeepSeek: DeepSeek V3
  calculator.registerPricing('openrouter/deepseek/deepseek-chat', {
    inputTokensReadUncachedPPM: 0.32,
    outputTokensGeneratedPPM: 0.89,
  });
  // DeepSeek: DeepSeek V3 0324
  calculator.registerPricing('openrouter/deepseek/deepseek-chat-v3-0324', {
    inputTokensReadUncachedPPM: 0.2,
    inputTokensReadCachedPPM: 0.135,
    outputTokensGeneratedPPM: 0.77,
  });
  // DeepSeek: DeepSeek V3.1
  calculator.registerPricing('openrouter/deepseek/deepseek-chat-v3.1', {
    inputTokensReadUncachedPPM: 0.15,
    outputTokensGeneratedPPM: 0.75,
  });
  // DeepSeek: R1
  calculator.registerPricing('openrouter/deepseek/deepseek-r1', {
    inputTokensReadUncachedPPM: 0.7,
    outputTokensGeneratedPPM: 2.5,
  });
}
