// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart31(calculator: PriceCalculator) {
  // OpenAI: gpt-oss-20b (free)
  calculator.registerPricing('openrouter/openai/gpt-oss-20b:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // OpenAI: gpt-oss-safeguard-20b
  calculator.registerPricing('openrouter/openai/gpt-oss-safeguard-20b', {
    inputTokensReadUncachedPPM: 0.075,
    inputTokensReadCachedPPM: 0.037,
    outputTokensGeneratedPPM: 0.3,
  });
  // OpenAI: o1
  calculator.registerPricing('openrouter/openai/o1', {
    inputTokensReadUncachedPPM: 15,
    inputTokensReadCachedPPM: 7.5,
    outputTokensGeneratedPPM: 60,
  });
  // OpenAI: o1-pro
  calculator.registerPricing('openrouter/openai/o1-pro', {
    inputTokensReadUncachedPPM: 150,
    outputTokensGeneratedPPM: 600,
  });
  // OpenAI: o3
  calculator.registerPricing('openrouter/openai/o3', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.5,
    outputTokensGeneratedPPM: 8,
  });
  // OpenAI: o3 Deep Research
  calculator.registerPricing('openrouter/openai/o3-deep-research', {
    inputTokensReadUncachedPPM: 10,
    inputTokensReadCachedPPM: 2.5,
    outputTokensGeneratedPPM: 40,
  });
  // OpenAI: o3 Mini
  calculator.registerPricing('openrouter/openai/o3-mini', {
    inputTokensReadUncachedPPM: 1.1,
    inputTokensReadCachedPPM: 0.55,
    outputTokensGeneratedPPM: 4.4,
  });
  // OpenAI: o3 Mini High
  calculator.registerPricing('openrouter/openai/o3-mini-high', {
    inputTokensReadUncachedPPM: 1.1,
    inputTokensReadCachedPPM: 0.55,
    outputTokensGeneratedPPM: 4.4,
  });
}
