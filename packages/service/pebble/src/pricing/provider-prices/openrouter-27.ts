// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart27(calculator: PriceCalculator) {
  // OpenAI: GPT-5
  calculator.registerPricing('openrouter/openai/gpt-5', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-5 Chat
  calculator.registerPricing('openrouter/openai/gpt-5-chat', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-5 Codex
  calculator.registerPricing('openrouter/openai/gpt-5-codex', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-5 Image
  calculator.registerPricing('openrouter/openai/gpt-5-image', {
    inputTokensReadUncachedPPM: 10,
    inputTokensReadCachedPPM: 1.25,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-5 Image Mini
  calculator.registerPricing('openrouter/openai/gpt-5-image-mini', {
    inputTokensReadUncachedPPM: 2.5,
    inputTokensReadCachedPPM: 0.25,
    outputTokensGeneratedPPM: 2,
  });
  // OpenAI: GPT-5 Mini
  calculator.registerPricing('openrouter/openai/gpt-5-mini', {
    inputTokensReadUncachedPPM: 0.25,
    inputTokensReadCachedPPM: 0.025,
    outputTokensGeneratedPPM: 2,
  });
  // OpenAI: GPT-5 Nano
  calculator.registerPricing('openrouter/openai/gpt-5-nano', {
    inputTokensReadUncachedPPM: 0.05,
    inputTokensReadCachedPPM: 0.01,
    outputTokensGeneratedPPM: 0.4,
  });
  // OpenAI: GPT-5 Pro
  calculator.registerPricing('openrouter/openai/gpt-5-pro', {
    inputTokensReadUncachedPPM: 15,
    outputTokensGeneratedPPM: 120,
  });
}
