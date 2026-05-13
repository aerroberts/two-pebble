// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart22(calculator: PriceCalculator) {
  // MoonshotAI: Kimi K2.6
  calculator.registerPricing('openrouter/moonshotai/kimi-k2.6', {
    inputTokensReadUncachedPPM: 0.75,
    inputTokensReadCachedPPM: 0.15,
    outputTokensGeneratedPPM: 3.5,
  });
  // Morph: Morph V3 Fast
  calculator.registerPricing('openrouter/morph/morph-v3-fast', {
    inputTokensReadUncachedPPM: 0.8,
    outputTokensGeneratedPPM: 1.2,
  });
  // Morph: Morph V3 Large
  calculator.registerPricing('openrouter/morph/morph-v3-large', {
    inputTokensReadUncachedPPM: 0.9,
    outputTokensGeneratedPPM: 1.9,
  });
  // Nex AGI: DeepSeek V3.1 Nex N1
  calculator.registerPricing('openrouter/nex-agi/deepseek-v3.1-nex-n1', {
    inputTokensReadUncachedPPM: 0.135,
    outputTokensGeneratedPPM: 0.5,
  });
  // NousResearch: Hermes 2 Pro - Llama-3 8B
  calculator.registerPricing('openrouter/nousresearch/hermes-2-pro-llama-3-8b', {
    inputTokensReadUncachedPPM: 0.14,
    outputTokensGeneratedPPM: 0.14,
  });
  // Nous: Hermes 3 405B Instruct
  calculator.registerPricing('openrouter/nousresearch/hermes-3-llama-3.1-405b', {
    inputTokensReadUncachedPPM: 1,
    outputTokensGeneratedPPM: 1,
  });
  // Nous: Hermes 3 405B Instruct (free)
  calculator.registerPricing('openrouter/nousresearch/hermes-3-llama-3.1-405b:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Nous: Hermes 3 70B Instruct
  calculator.registerPricing('openrouter/nousresearch/hermes-3-llama-3.1-70b', {
    inputTokensReadUncachedPPM: 0.3,
    outputTokensGeneratedPPM: 0.3,
  });
}
