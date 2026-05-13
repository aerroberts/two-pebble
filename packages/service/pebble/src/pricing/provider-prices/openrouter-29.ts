// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart29(calculator: PriceCalculator) {
  // OpenAI: GPT-5.2 Pro
  calculator.registerPricing('openrouter/openai/gpt-5.2-pro', {
    inputTokensReadUncachedPPM: 21,
    outputTokensGeneratedPPM: 168,
  });
  // OpenAI: GPT-5.3 Chat
  calculator.registerPricing('openrouter/openai/gpt-5.3-chat', {
    inputTokensReadUncachedPPM: 1.75,
    inputTokensReadCachedPPM: 0.175,
    outputTokensGeneratedPPM: 14,
  });
  // OpenAI: GPT-5.3-Codex
  calculator.registerPricing('openrouter/openai/gpt-5.3-codex', {
    inputTokensReadUncachedPPM: 1.75,
    inputTokensReadCachedPPM: 0.175,
    outputTokensGeneratedPPM: 14,
  });
  // OpenAI: GPT-5.4
  calculator.registerPricing('openrouter/openai/gpt-5.4', {
    inputTokensReadUncachedPPM: 2.5,
    inputTokensReadCachedPPM: 0.25,
    outputTokensGeneratedPPM: 15,
  });
  // OpenAI: GPT-5.4 Image 2
  calculator.registerPricing('openrouter/openai/gpt-5.4-image-2', {
    inputTokensReadUncachedPPM: 8,
    inputTokensReadCachedPPM: 2,
    outputTokensGeneratedPPM: 15,
  });
  // OpenAI: GPT-5.4 Mini
  calculator.registerPricing('openrouter/openai/gpt-5.4-mini', {
    inputTokensReadUncachedPPM: 0.75,
    inputTokensReadCachedPPM: 0.075,
    outputTokensGeneratedPPM: 4.5,
  });
  // OpenAI: GPT-5.4 Nano
  calculator.registerPricing('openrouter/openai/gpt-5.4-nano', {
    inputTokensReadUncachedPPM: 0.2,
    inputTokensReadCachedPPM: 0.02,
    outputTokensGeneratedPPM: 1.25,
  });
  // OpenAI: GPT-5.4 Pro
  calculator.registerPricing('openrouter/openai/gpt-5.4-pro', {
    inputTokensReadUncachedPPM: 30,
    outputTokensGeneratedPPM: 180,
  });
}
