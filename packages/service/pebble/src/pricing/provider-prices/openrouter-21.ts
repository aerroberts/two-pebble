// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart21(calculator: PriceCalculator) {
  // Mistral: Mistral Small 3.2 24B
  calculator.registerPricing('openrouter/mistralai/mistral-small-3.2-24b-instruct', {
    inputTokensReadUncachedPPM: 0.075,
    outputTokensGeneratedPPM: 0.2,
  });
  // Mistral: Mixtral 8x22B Instruct
  calculator.registerPricing('openrouter/mistralai/mixtral-8x22b-instruct', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.2,
    outputTokensGeneratedPPM: 6,
  });
  // Mistral: Pixtral Large 2411
  calculator.registerPricing('openrouter/mistralai/pixtral-large-2411', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.2,
    outputTokensGeneratedPPM: 6,
  });
  // Mistral: Voxtral Small 24B 2507
  calculator.registerPricing('openrouter/mistralai/voxtral-small-24b-2507', {
    inputTokensReadUncachedPPM: 0.1,
    inputTokensReadCachedPPM: 0.01,
    outputTokensGeneratedPPM: 0.3,
  });
  // MoonshotAI: Kimi K2 0711
  calculator.registerPricing('openrouter/moonshotai/kimi-k2', {
    inputTokensReadUncachedPPM: 0.57,
    outputTokensGeneratedPPM: 2.3,
  });
  // MoonshotAI: Kimi K2 0905
  calculator.registerPricing('openrouter/moonshotai/kimi-k2-0905', {
    inputTokensReadUncachedPPM: 0.4,
    outputTokensGeneratedPPM: 2,
  });
  // MoonshotAI: Kimi K2 Thinking
  calculator.registerPricing('openrouter/moonshotai/kimi-k2-thinking', {
    inputTokensReadUncachedPPM: 0.6,
    inputTokensReadCachedPPM: 0.15,
    outputTokensGeneratedPPM: 2.5,
  });
  // MoonshotAI: Kimi K2.5
  calculator.registerPricing('openrouter/moonshotai/kimi-k2.5', {
    inputTokensReadUncachedPPM: 0.4,
    inputTokensReadCachedPPM: 0.05,
    outputTokensGeneratedPPM: 1.98,
  });
}
