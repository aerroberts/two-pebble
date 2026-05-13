// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart26(calculator: PriceCalculator) {
  // OpenAI: GPT-4o (2024-05-13)
  calculator.registerPricing('openrouter/openai/gpt-4o-2024-05-13', {
    inputTokensReadUncachedPPM: 5,
    outputTokensGeneratedPPM: 15,
  });
  // OpenAI: GPT-4o (2024-08-06)
  calculator.registerPricing('openrouter/openai/gpt-4o-2024-08-06', {
    inputTokensReadUncachedPPM: 2.5,
    inputTokensReadCachedPPM: 1.25,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-4o (2024-11-20)
  calculator.registerPricing('openrouter/openai/gpt-4o-2024-11-20', {
    inputTokensReadUncachedPPM: 2.5,
    inputTokensReadCachedPPM: 1.25,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-4o Audio
  calculator.registerPricing('openrouter/openai/gpt-4o-audio-preview', {
    inputTokensReadUncachedPPM: 2.5,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-4o-mini
  calculator.registerPricing('openrouter/openai/gpt-4o-mini', {
    inputTokensReadUncachedPPM: 0.15,
    inputTokensReadCachedPPM: 0.075,
    outputTokensGeneratedPPM: 0.6,
  });
  // OpenAI: GPT-4o-mini (2024-07-18)
  calculator.registerPricing('openrouter/openai/gpt-4o-mini-2024-07-18', {
    inputTokensReadUncachedPPM: 0.15,
    inputTokensReadCachedPPM: 0.075,
    outputTokensGeneratedPPM: 0.6,
  });
  // OpenAI: GPT-4o-mini Search Preview
  calculator.registerPricing('openrouter/openai/gpt-4o-mini-search-preview', {
    inputTokensReadUncachedPPM: 0.15,
    outputTokensGeneratedPPM: 0.6,
  });
  // OpenAI: GPT-4o Search Preview
  calculator.registerPricing('openrouter/openai/gpt-4o-search-preview', {
    inputTokensReadUncachedPPM: 2.5,
    outputTokensGeneratedPPM: 10,
  });
}
