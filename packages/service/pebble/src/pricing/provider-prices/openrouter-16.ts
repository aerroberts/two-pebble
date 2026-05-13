// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart16(calculator: PriceCalculator) {
  // Meta: Llama 3.2 1B Instruct
  calculator.registerPricing('openrouter/meta-llama/llama-3.2-1b-instruct', {
    inputTokensReadUncachedPPM: 0.027,
    outputTokensGeneratedPPM: 0.2,
  });
  // Meta: Llama 3.2 3B Instruct
  calculator.registerPricing('openrouter/meta-llama/llama-3.2-3b-instruct', {
    inputTokensReadUncachedPPM: 0.051,
    outputTokensGeneratedPPM: 0.34,
  });
  // Meta: Llama 3.2 3B Instruct (free)
  calculator.registerPricing('openrouter/meta-llama/llama-3.2-3b-instruct:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Meta: Llama 3.3 70B Instruct
  calculator.registerPricing('openrouter/meta-llama/llama-3.3-70b-instruct', {
    inputTokensReadUncachedPPM: 0.1,
    outputTokensGeneratedPPM: 0.32,
  });
  // Meta: Llama 3.3 70B Instruct (free)
  calculator.registerPricing('openrouter/meta-llama/llama-3.3-70b-instruct:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Meta: Llama 4 Maverick
  calculator.registerPricing('openrouter/meta-llama/llama-4-maverick', {
    inputTokensReadUncachedPPM: 0.15,
    outputTokensGeneratedPPM: 0.6,
  });
  // Meta: Llama 4 Scout
  calculator.registerPricing('openrouter/meta-llama/llama-4-scout', {
    inputTokensReadUncachedPPM: 0.08,
    outputTokensGeneratedPPM: 0.3,
  });
  // Llama Guard 3 8B
  calculator.registerPricing('openrouter/meta-llama/llama-guard-3-8b', {
    inputTokensReadUncachedPPM: 0.48,
    outputTokensGeneratedPPM: 0.03,
  });
}
