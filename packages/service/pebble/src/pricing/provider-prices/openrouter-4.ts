// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart4(calculator: PriceCalculator) {
  // Anthropic: Claude 3.5 Haiku
  calculator.registerPricing('openrouter/anthropic/claude-3.5-haiku', {
    inputTokensReadUncachedPPM: 0.8,
    inputTokensReadCachedPPM: 0.08,
    inputTokensWriteCachedPPM: 1,
    outputTokensGeneratedPPM: 4,
  });
  // Anthropic: Claude Haiku 4.5
  calculator.registerPricing('openrouter/anthropic/claude-haiku-4.5', {
    inputTokensReadUncachedPPM: 1,
    inputTokensReadCachedPPM: 0.1,
    inputTokensWriteCachedPPM: 1.25,
    outputTokensGeneratedPPM: 5,
  });
  // Anthropic: Claude Opus 4
  calculator.registerPricing('openrouter/anthropic/claude-opus-4', {
    inputTokensReadUncachedPPM: 15,
    inputTokensReadCachedPPM: 1.5,
    inputTokensWriteCachedPPM: 18.75,
    outputTokensGeneratedPPM: 75,
  });
  // Anthropic: Claude Opus 4.1
  calculator.registerPricing('openrouter/anthropic/claude-opus-4.1', {
    inputTokensReadUncachedPPM: 15,
    inputTokensReadCachedPPM: 1.5,
    inputTokensWriteCachedPPM: 18.75,
    outputTokensGeneratedPPM: 75,
  });
  // Anthropic: Claude Opus 4.5
  calculator.registerPricing('openrouter/anthropic/claude-opus-4.5', {
    inputTokensReadUncachedPPM: 5,
    inputTokensReadCachedPPM: 0.5,
    inputTokensWriteCachedPPM: 6.25,
    outputTokensGeneratedPPM: 25,
  });
  // Anthropic: Claude Opus 4.6
  calculator.registerPricing('openrouter/anthropic/claude-opus-4.6', {
    inputTokensReadUncachedPPM: 5,
    inputTokensReadCachedPPM: 0.5,
    inputTokensWriteCachedPPM: 6.25,
    outputTokensGeneratedPPM: 25,
  });
  // Anthropic: Claude Opus 4.6 (Fast)
  calculator.registerPricing('openrouter/anthropic/claude-opus-4.6-fast', {
    inputTokensReadUncachedPPM: 30,
    inputTokensReadCachedPPM: 3,
    inputTokensWriteCachedPPM: 37.5,
    outputTokensGeneratedPPM: 150,
  });
  // Anthropic: Claude Opus 4.7
  calculator.registerPricing('openrouter/anthropic/claude-opus-4.7', {
    inputTokensReadUncachedPPM: 5,
    inputTokensReadCachedPPM: 0.5,
    inputTokensWriteCachedPPM: 6.25,
    outputTokensGeneratedPPM: 25,
  });
}
