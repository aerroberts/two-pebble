// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart28(calculator: PriceCalculator) {
  // OpenAI: GPT-5.1
  calculator.registerPricing('openrouter/openai/gpt-5.1', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.13,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-5.1 Chat
  calculator.registerPricing('openrouter/openai/gpt-5.1-chat', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-5.1-Codex
  calculator.registerPricing('openrouter/openai/gpt-5.1-codex', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-5.1-Codex-Max
  calculator.registerPricing('openrouter/openai/gpt-5.1-codex-max', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-5.1-Codex-Mini
  calculator.registerPricing('openrouter/openai/gpt-5.1-codex-mini', {
    inputTokensReadUncachedPPM: 0.25,
    inputTokensReadCachedPPM: 0.03,
    outputTokensGeneratedPPM: 2,
  });
  // OpenAI: GPT-5.2
  calculator.registerPricing('openrouter/openai/gpt-5.2', {
    inputTokensReadUncachedPPM: 1.75,
    inputTokensReadCachedPPM: 0.175,
    outputTokensGeneratedPPM: 14,
  });
  // OpenAI: GPT-5.2 Chat
  calculator.registerPricing('openrouter/openai/gpt-5.2-chat', {
    inputTokensReadUncachedPPM: 1.75,
    inputTokensReadCachedPPM: 0.175,
    outputTokensGeneratedPPM: 14,
  });
  // OpenAI: GPT-5.2-Codex
  calculator.registerPricing('openrouter/openai/gpt-5.2-codex', {
    inputTokensReadUncachedPPM: 1.75,
    inputTokensReadCachedPPM: 0.175,
    outputTokensGeneratedPPM: 14,
  });
}
