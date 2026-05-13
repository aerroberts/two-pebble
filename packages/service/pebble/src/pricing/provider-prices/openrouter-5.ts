// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart5(calculator: PriceCalculator) {
  // Anthropic: Claude Sonnet 4
  calculator.registerPricing('openrouter/anthropic/claude-sonnet-4', {
    inputTokensReadUncachedPPM: 3,
    inputTokensReadCachedPPM: 0.3,
    inputTokensWriteCachedPPM: 3.75,
    outputTokensGeneratedPPM: 15,
  });
  // Anthropic: Claude Sonnet 4.5
  calculator.registerPricing('openrouter/anthropic/claude-sonnet-4.5', {
    inputTokensReadUncachedPPM: 3,
    inputTokensReadCachedPPM: 0.3,
    inputTokensWriteCachedPPM: 3.75,
    outputTokensGeneratedPPM: 15,
  });
  // Anthropic: Claude Sonnet 4.6
  calculator.registerPricing('openrouter/anthropic/claude-sonnet-4.6', {
    inputTokensReadUncachedPPM: 3,
    inputTokensReadCachedPPM: 0.3,
    inputTokensWriteCachedPPM: 3.75,
    outputTokensGeneratedPPM: 15,
  });
  // Arcee AI: Coder Large
  calculator.registerPricing('openrouter/arcee-ai/coder-large', {
    inputTokensReadUncachedPPM: 0.5,
    outputTokensGeneratedPPM: 0.8,
  });
  // Arcee AI: Maestro Reasoning
  calculator.registerPricing('openrouter/arcee-ai/maestro-reasoning', {
    inputTokensReadUncachedPPM: 0.9,
    outputTokensGeneratedPPM: 3.3,
  });
  // Arcee AI: Spotlight
  calculator.registerPricing('openrouter/arcee-ai/spotlight', {
    inputTokensReadUncachedPPM: 0.18,
    outputTokensGeneratedPPM: 0.18,
  });
  // Arcee AI: Trinity Large Preview
  calculator.registerPricing('openrouter/arcee-ai/trinity-large-preview', {
    inputTokensReadUncachedPPM: 0.15,
    outputTokensGeneratedPPM: 0.45,
  });
  // Arcee AI: Trinity Large Thinking
  calculator.registerPricing('openrouter/arcee-ai/trinity-large-thinking', {
    inputTokensReadUncachedPPM: 0.22,
    inputTokensReadCachedPPM: 0.06,
    outputTokensGeneratedPPM: 0.85,
  });
}
