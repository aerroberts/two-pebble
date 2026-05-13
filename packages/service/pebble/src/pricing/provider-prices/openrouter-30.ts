// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart30(calculator: PriceCalculator) {
  // OpenAI: GPT-5.5
  calculator.registerPricing('openrouter/openai/gpt-5.5', {
    inputTokensReadUncachedPPM: 5,
    inputTokensReadCachedPPM: 0.5,
    outputTokensGeneratedPPM: 30,
  });
  // OpenAI: GPT-5.5 Pro
  calculator.registerPricing('openrouter/openai/gpt-5.5-pro', {
    inputTokensReadUncachedPPM: 30,
    outputTokensGeneratedPPM: 180,
  });
  // OpenAI: GPT Audio
  calculator.registerPricing('openrouter/openai/gpt-audio', {
    inputTokensReadUncachedPPM: 2.5,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT Audio Mini
  calculator.registerPricing('openrouter/openai/gpt-audio-mini', {
    inputTokensReadUncachedPPM: 0.6,
    outputTokensGeneratedPPM: 2.4,
  });
  // OpenAI: GPT Chat Latest
  calculator.registerPricing('openrouter/openai/gpt-chat-latest', {
    inputTokensReadUncachedPPM: 5,
    inputTokensReadCachedPPM: 0.5,
    outputTokensGeneratedPPM: 30,
  });
  // OpenAI: gpt-oss-120b
  calculator.registerPricing('openrouter/openai/gpt-oss-120b', {
    inputTokensReadUncachedPPM: 0.039,
    outputTokensGeneratedPPM: 0.18,
  });
  // OpenAI: gpt-oss-120b (free)
  calculator.registerPricing('openrouter/openai/gpt-oss-120b:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // OpenAI: gpt-oss-20b
  calculator.registerPricing('openrouter/openai/gpt-oss-20b', {
    inputTokensReadUncachedPPM: 0.03,
    outputTokensGeneratedPPM: 0.14,
  });
}
