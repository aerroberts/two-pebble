// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart15(calculator: PriceCalculator) {
  // LiquidAI: LFM2.5-1.2B-Instruct (free)
  calculator.registerPricing('openrouter/liquid/lfm-2.5-1.2b-instruct:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // LiquidAI: LFM2.5-1.2B-Thinking (free)
  calculator.registerPricing('openrouter/liquid/lfm-2.5-1.2b-thinking:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Mancer: Weaver (alpha)
  calculator.registerPricing('openrouter/mancer/weaver', {
    inputTokensReadUncachedPPM: 0.75,
    outputTokensGeneratedPPM: 1,
  });
  // Meta: Llama 3 70B Instruct
  calculator.registerPricing('openrouter/meta-llama/llama-3-70b-instruct', {
    inputTokensReadUncachedPPM: 0.51,
    outputTokensGeneratedPPM: 0.74,
  });
  // Meta: Llama 3 8B Instruct
  calculator.registerPricing('openrouter/meta-llama/llama-3-8b-instruct', {
    inputTokensReadUncachedPPM: 0.04,
    outputTokensGeneratedPPM: 0.04,
  });
  // Meta: Llama 3.1 70B Instruct
  calculator.registerPricing('openrouter/meta-llama/llama-3.1-70b-instruct', {
    inputTokensReadUncachedPPM: 0.4,
    outputTokensGeneratedPPM: 0.4,
  });
  // Meta: Llama 3.1 8B Instruct
  calculator.registerPricing('openrouter/meta-llama/llama-3.1-8b-instruct', {
    inputTokensReadUncachedPPM: 0.02,
    outputTokensGeneratedPPM: 0.05,
  });
  // Meta: Llama 3.2 11B Vision Instruct
  calculator.registerPricing('openrouter/meta-llama/llama-3.2-11b-vision-instruct', {
    inputTokensReadUncachedPPM: 0.245,
    outputTokensGeneratedPPM: 0.245,
  });
}
