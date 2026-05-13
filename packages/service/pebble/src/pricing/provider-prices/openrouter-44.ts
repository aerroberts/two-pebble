// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart44(calculator: PriceCalculator) {
  // xAI: Grok 4.20 Multi-Agent
  calculator.registerPricing('openrouter/x-ai/grok-4.20-multi-agent', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.2,
    outputTokensGeneratedPPM: 6,
  });
  // xAI: Grok 4.3
  calculator.registerPricing('openrouter/x-ai/grok-4.3', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.2,
    outputTokensGeneratedPPM: 2.5,
  });
  // xAI: Grok Code Fast 1
  calculator.registerPricing('openrouter/x-ai/grok-code-fast-1', {
    inputTokensReadUncachedPPM: 0.2,
    inputTokensReadCachedPPM: 0.02,
    outputTokensGeneratedPPM: 1.5,
  });
  // Xiaomi: MiMo-V2-Flash
  calculator.registerPricing('openrouter/xiaomi/mimo-v2-flash', {
    inputTokensReadUncachedPPM: 0.1,
    inputTokensReadCachedPPM: 0.01,
    outputTokensGeneratedPPM: 0.3,
  });
  // Xiaomi: MiMo-V2-Omni
  calculator.registerPricing('openrouter/xiaomi/mimo-v2-omni', {
    inputTokensReadUncachedPPM: 0.4,
    inputTokensReadCachedPPM: 0.08,
    outputTokensGeneratedPPM: 2,
  });
  // Xiaomi: MiMo-V2-Pro
  calculator.registerPricing('openrouter/xiaomi/mimo-v2-pro', {
    inputTokensReadUncachedPPM: 1,
    inputTokensReadCachedPPM: 0.2,
    outputTokensGeneratedPPM: 3,
  });
  // Xiaomi: MiMo-V2.5
  calculator.registerPricing('openrouter/xiaomi/mimo-v2.5', {
    inputTokensReadUncachedPPM: 0.4,
    inputTokensReadCachedPPM: 0.08,
    outputTokensGeneratedPPM: 2,
  });
  // Xiaomi: MiMo-V2.5-Pro
  calculator.registerPricing('openrouter/xiaomi/mimo-v2.5-pro', {
    inputTokensReadUncachedPPM: 1,
    inputTokensReadCachedPPM: 0.2,
    outputTokensGeneratedPPM: 3,
  });
}
