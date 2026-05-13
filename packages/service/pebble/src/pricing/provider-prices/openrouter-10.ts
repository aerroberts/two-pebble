// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart10(calculator: PriceCalculator) {
  // DeepSeek: DeepSeek V4 Pro
  calculator.registerPricing('openrouter/deepseek/deepseek-v4-pro', {
    inputTokensReadUncachedPPM: 0.435,
    inputTokensReadCachedPPM: 0.003625,
    outputTokensGeneratedPPM: 0.87,
  });
  // EssentialAI: Rnj 1 Instruct
  calculator.registerPricing('openrouter/essentialai/rnj-1-instruct', {
    inputTokensReadUncachedPPM: 0.15,
    outputTokensGeneratedPPM: 0.15,
  });
  // Google: Gemini 2.0 Flash
  calculator.registerPricing('openrouter/google/gemini-2.0-flash-001', {
    inputTokensReadUncachedPPM: 0.1,
    inputTokensReadCachedPPM: 0.025,
    inputTokensWriteCachedPPM: 0.083333,
    outputTokensGeneratedPPM: 0.4,
  });
  // Google: Gemini 2.0 Flash Lite
  calculator.registerPricing('openrouter/google/gemini-2.0-flash-lite-001', {
    inputTokensReadUncachedPPM: 0.075,
    outputTokensGeneratedPPM: 0.3,
  });
  // Google: Gemini 2.5 Flash
  calculator.registerPricing('openrouter/google/gemini-2.5-flash', {
    inputTokensReadUncachedPPM: 0.3,
    inputTokensReadCachedPPM: 0.03,
    inputTokensWriteCachedPPM: 0.083333,
    outputTokensGeneratedPPM: 2.5,
  });
  // Google: Nano Banana (Gemini 2.5 Flash Image)
  calculator.registerPricing('openrouter/google/gemini-2.5-flash-image', {
    inputTokensReadUncachedPPM: 0.3,
    inputTokensReadCachedPPM: 0.03,
    inputTokensWriteCachedPPM: 0.083333,
    outputTokensGeneratedPPM: 2.5,
  });
  // Google: Gemini 2.5 Flash Lite
  calculator.registerPricing('openrouter/google/gemini-2.5-flash-lite', {
    inputTokensReadUncachedPPM: 0.1,
    inputTokensReadCachedPPM: 0.01,
    inputTokensWriteCachedPPM: 0.083333,
    outputTokensGeneratedPPM: 0.4,
  });
  // Google: Gemini 2.5 Flash Lite Preview 09-2025
  calculator.registerPricing('openrouter/google/gemini-2.5-flash-lite-preview-09-2025', {
    inputTokensReadUncachedPPM: 0.1,
    inputTokensReadCachedPPM: 0.01,
    inputTokensWriteCachedPPM: 0.083333,
    outputTokensGeneratedPPM: 0.4,
  });
}
