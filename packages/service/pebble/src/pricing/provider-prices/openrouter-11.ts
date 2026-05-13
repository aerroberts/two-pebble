// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart11(calculator: PriceCalculator) {
  // Google: Gemini 2.5 Pro
  calculator.registerPricing('openrouter/google/gemini-2.5-pro', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    inputTokensWriteCachedPPM: 0.375,
    outputTokensGeneratedPPM: 10,
  });
  // Google: Gemini 2.5 Pro Preview 06-05
  calculator.registerPricing('openrouter/google/gemini-2.5-pro-preview', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    inputTokensWriteCachedPPM: 0.375,
    outputTokensGeneratedPPM: 10,
  });
  // Google: Gemini 2.5 Pro Preview 05-06
  calculator.registerPricing('openrouter/google/gemini-2.5-pro-preview-05-06', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    inputTokensWriteCachedPPM: 0.375,
    outputTokensGeneratedPPM: 10,
  });
  // Google: Gemini 3 Flash Preview
  calculator.registerPricing('openrouter/google/gemini-3-flash-preview', {
    inputTokensReadUncachedPPM: 0.5,
    inputTokensReadCachedPPM: 0.05,
    inputTokensWriteCachedPPM: 0.083333,
    outputTokensGeneratedPPM: 3,
  });
  // Google: Nano Banana Pro (Gemini 3 Pro Image Preview)
  calculator.registerPricing('openrouter/google/gemini-3-pro-image-preview', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.2,
    inputTokensWriteCachedPPM: 0.375,
    outputTokensGeneratedPPM: 12,
  });
  // Google: Nano Banana 2 (Gemini 3.1 Flash Image Preview)
  calculator.registerPricing('openrouter/google/gemini-3.1-flash-image-preview', {
    inputTokensReadUncachedPPM: 0.5,
    outputTokensGeneratedPPM: 3,
  });
  // Google: Gemini 3.1 Flash Lite
  calculator.registerPricing('openrouter/google/gemini-3.1-flash-lite', {
    inputTokensReadUncachedPPM: 0.25,
    inputTokensReadCachedPPM: 0.025,
    inputTokensWriteCachedPPM: 0.083333,
    outputTokensGeneratedPPM: 1.5,
  });
  // Google: Gemini 3.1 Flash Lite Preview
  calculator.registerPricing('openrouter/google/gemini-3.1-flash-lite-preview', {
    inputTokensReadUncachedPPM: 0.25,
    inputTokensReadCachedPPM: 0.025,
    inputTokensWriteCachedPPM: 0.083333,
    outputTokensGeneratedPPM: 1.5,
  });
}
