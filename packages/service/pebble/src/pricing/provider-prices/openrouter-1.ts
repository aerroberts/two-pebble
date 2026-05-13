// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart1(calculator: PriceCalculator) {
  // Anthropic Claude Haiku Latest
  calculator.registerPricing('openrouter/~anthropic/claude-haiku-latest', {
    inputTokensReadUncachedPPM: 1,
    inputTokensReadCachedPPM: 0.1,
    inputTokensWriteCachedPPM: 1.25,
    outputTokensGeneratedPPM: 5,
  });
  // Anthropic: Claude Opus Latest
  calculator.registerPricing('openrouter/~anthropic/claude-opus-latest', {
    inputTokensReadUncachedPPM: 5,
    inputTokensReadCachedPPM: 0.5,
    inputTokensWriteCachedPPM: 6.25,
    outputTokensGeneratedPPM: 25,
  });
  // Anthropic Claude Sonnet Latest
  calculator.registerPricing('openrouter/~anthropic/claude-sonnet-latest', {
    inputTokensReadUncachedPPM: 3,
    inputTokensReadCachedPPM: 0.3,
    inputTokensWriteCachedPPM: 3.75,
    outputTokensGeneratedPPM: 15,
  });
  // Google Gemini Flash Latest
  calculator.registerPricing('openrouter/~google/gemini-flash-latest', {
    inputTokensReadUncachedPPM: 0.5,
    inputTokensReadCachedPPM: 0.05,
    inputTokensWriteCachedPPM: 0.083333,
    outputTokensGeneratedPPM: 3,
  });
  // Google Gemini Pro Latest
  calculator.registerPricing('openrouter/~google/gemini-pro-latest', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.2,
    inputTokensWriteCachedPPM: 0.375,
    outputTokensGeneratedPPM: 12,
  });
  // MoonshotAI Kimi Latest
  calculator.registerPricing('openrouter/~moonshotai/kimi-latest', {
    inputTokensReadUncachedPPM: 0.75,
    inputTokensReadCachedPPM: 0.15,
    outputTokensGeneratedPPM: 3.5,
  });
  // OpenAI GPT Latest
  calculator.registerPricing('openrouter/~openai/gpt-latest', {
    inputTokensReadUncachedPPM: 5,
    inputTokensReadCachedPPM: 0.5,
    outputTokensGeneratedPPM: 30,
  });
  // OpenAI GPT Mini Latest
  calculator.registerPricing('openrouter/~openai/gpt-mini-latest', {
    inputTokensReadUncachedPPM: 0.75,
    inputTokensReadCachedPPM: 0.075,
    outputTokensGeneratedPPM: 4.5,
  });
}
