// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart3(calculator: PriceCalculator) {
  // Goliath 120B
  calculator.registerPricing('openrouter/alpindale/goliath-120b', {
    inputTokensReadUncachedPPM: 3.75,
    outputTokensGeneratedPPM: 7.5,
  });
  // Amazon: Nova 2 Lite
  calculator.registerPricing('openrouter/amazon/nova-2-lite-v1', {
    inputTokensReadUncachedPPM: 0.3,
    outputTokensGeneratedPPM: 2.5,
  });
  // Amazon: Nova Lite 1.0
  calculator.registerPricing('openrouter/amazon/nova-lite-v1', {
    inputTokensReadUncachedPPM: 0.06,
    outputTokensGeneratedPPM: 0.24,
  });
  // Amazon: Nova Micro 1.0
  calculator.registerPricing('openrouter/amazon/nova-micro-v1', {
    inputTokensReadUncachedPPM: 0.035,
    outputTokensGeneratedPPM: 0.14,
  });
  // Amazon: Nova Premier 1.0
  calculator.registerPricing('openrouter/amazon/nova-premier-v1', {
    inputTokensReadUncachedPPM: 2.5,
    inputTokensReadCachedPPM: 0.625,
    outputTokensGeneratedPPM: 12.5,
  });
  // Amazon: Nova Pro 1.0
  calculator.registerPricing('openrouter/amazon/nova-pro-v1', {
    inputTokensReadUncachedPPM: 0.8,
    outputTokensGeneratedPPM: 3.2,
  });
  // Magnum v4 72B
  calculator.registerPricing('openrouter/anthracite-org/magnum-v4-72b', {
    inputTokensReadUncachedPPM: 3,
    outputTokensGeneratedPPM: 5,
  });
  // Anthropic: Claude 3 Haiku
  calculator.registerPricing('openrouter/anthropic/claude-3-haiku', {
    inputTokensReadUncachedPPM: 0.25,
    inputTokensReadCachedPPM: 0.03,
    inputTokensWriteCachedPPM: 0.3,
    outputTokensGeneratedPPM: 1.25,
  });
}
