// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart32(calculator: PriceCalculator) {
  // OpenAI: o3 Pro
  calculator.registerPricing('openrouter/openai/o3-pro', {
    inputTokensReadUncachedPPM: 20,
    outputTokensGeneratedPPM: 80,
  });
  // OpenAI: o4 Mini
  calculator.registerPricing('openrouter/openai/o4-mini', {
    inputTokensReadUncachedPPM: 1.1,
    inputTokensReadCachedPPM: 0.275,
    outputTokensGeneratedPPM: 4.4,
  });
  // OpenAI: o4 Mini Deep Research
  calculator.registerPricing('openrouter/openai/o4-mini-deep-research', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.5,
    outputTokensGeneratedPPM: 8,
  });
  // OpenAI: o4 Mini High
  calculator.registerPricing('openrouter/openai/o4-mini-high', {
    inputTokensReadUncachedPPM: 1.1,
    inputTokensReadCachedPPM: 0.275,
    outputTokensGeneratedPPM: 4.4,
  });
  // Auto Router
  calculator.registerPricing('openrouter/openrouter/auto', {
    inputTokensReadUncachedPPM: -1000000,
    outputTokensGeneratedPPM: -1000000,
  });
  // Body Builder (beta)
  calculator.registerPricing('openrouter/openrouter/bodybuilder', {
    inputTokensReadUncachedPPM: -1000000,
    outputTokensGeneratedPPM: -1000000,
  });
  // Free Models Router
  calculator.registerPricing('openrouter/openrouter/free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Owl Alpha
  calculator.registerPricing('openrouter/openrouter/owl-alpha', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
}
