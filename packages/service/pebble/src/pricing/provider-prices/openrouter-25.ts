// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart25(calculator: PriceCalculator) {
  // OpenAI: GPT-4 (older v0314)
  calculator.registerPricing('openrouter/openai/gpt-4-0314', {
    inputTokensReadUncachedPPM: 30,
    outputTokensGeneratedPPM: 60,
  });
  // OpenAI: GPT-4 Turbo (older v1106)
  calculator.registerPricing('openrouter/openai/gpt-4-1106-preview', {
    inputTokensReadUncachedPPM: 10,
    outputTokensGeneratedPPM: 30,
  });
  // OpenAI: GPT-4 Turbo
  calculator.registerPricing('openrouter/openai/gpt-4-turbo', {
    inputTokensReadUncachedPPM: 10,
    outputTokensGeneratedPPM: 30,
  });
  // OpenAI: GPT-4 Turbo Preview
  calculator.registerPricing('openrouter/openai/gpt-4-turbo-preview', {
    inputTokensReadUncachedPPM: 10,
    outputTokensGeneratedPPM: 30,
  });
  // OpenAI: GPT-4.1
  calculator.registerPricing('openrouter/openai/gpt-4.1', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.5,
    outputTokensGeneratedPPM: 8,
  });
  // OpenAI: GPT-4.1 Mini
  calculator.registerPricing('openrouter/openai/gpt-4.1-mini', {
    inputTokensReadUncachedPPM: 0.4,
    inputTokensReadCachedPPM: 0.1,
    outputTokensGeneratedPPM: 1.6,
  });
  // OpenAI: GPT-4.1 Nano
  calculator.registerPricing('openrouter/openai/gpt-4.1-nano', {
    inputTokensReadUncachedPPM: 0.1,
    inputTokensReadCachedPPM: 0.025,
    outputTokensGeneratedPPM: 0.4,
  });
  // OpenAI: GPT-4o
  calculator.registerPricing('openrouter/openai/gpt-4o', {
    inputTokensReadUncachedPPM: 2.5,
    outputTokensGeneratedPPM: 10,
  });
}
