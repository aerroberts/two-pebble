// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart2(calculator: PriceCalculator) {
  // AI21: Jamba Large 1.7
  calculator.registerPricing('openrouter/ai21/jamba-large-1.7', {
    inputTokensReadUncachedPPM: 2,
    outputTokensGeneratedPPM: 8,
  });
  // AionLabs: Aion-1.0
  calculator.registerPricing('openrouter/aion-labs/aion-1.0', {
    inputTokensReadUncachedPPM: 4,
    outputTokensGeneratedPPM: 8,
  });
  // AionLabs: Aion-1.0-Mini
  calculator.registerPricing('openrouter/aion-labs/aion-1.0-mini', {
    inputTokensReadUncachedPPM: 0.7,
    outputTokensGeneratedPPM: 1.4,
  });
  // AionLabs: Aion-2.0
  calculator.registerPricing('openrouter/aion-labs/aion-2.0', {
    inputTokensReadUncachedPPM: 0.8,
    inputTokensReadCachedPPM: 0.2,
    outputTokensGeneratedPPM: 1.6,
  });
  // AionLabs: Aion-RP 1.0 (8B)
  calculator.registerPricing('openrouter/aion-labs/aion-rp-llama-3.1-8b', {
    inputTokensReadUncachedPPM: 0.8,
    outputTokensGeneratedPPM: 1.6,
  });
  // AlfredPros: CodeLLaMa 7B Instruct Solidity
  calculator.registerPricing('openrouter/alfredpros/codellama-7b-instruct-solidity', {
    inputTokensReadUncachedPPM: 0.8,
    outputTokensGeneratedPPM: 1.2,
  });
  // Tongyi DeepResearch 30B A3B
  calculator.registerPricing('openrouter/alibaba/tongyi-deepresearch-30b-a3b', {
    inputTokensReadUncachedPPM: 0.09,
    inputTokensReadCachedPPM: 0.09,
    outputTokensGeneratedPPM: 0.45,
  });
  // AllenAI: Olmo 3 32B Think
  calculator.registerPricing('openrouter/allenai/olmo-3-32b-think', {
    inputTokensReadUncachedPPM: 0.15,
    outputTokensGeneratedPPM: 0.5,
  });
}
