// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart7(calculator: PriceCalculator) {
  // Baidu: Qianfan-OCR-Fast (free)
  calculator.registerPricing('openrouter/baidu/qianfan-ocr-fast:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // ByteDance Seed: Seed 1.6
  calculator.registerPricing('openrouter/bytedance-seed/seed-1.6', {
    inputTokensReadUncachedPPM: 0.25,
    outputTokensGeneratedPPM: 2,
  });
  // ByteDance Seed: Seed 1.6 Flash
  calculator.registerPricing('openrouter/bytedance-seed/seed-1.6-flash', {
    inputTokensReadUncachedPPM: 0.075,
    outputTokensGeneratedPPM: 0.3,
  });
  // ByteDance Seed: Seed-2.0-Lite
  calculator.registerPricing('openrouter/bytedance-seed/seed-2.0-lite', {
    inputTokensReadUncachedPPM: 0.25,
    outputTokensGeneratedPPM: 2,
  });
  // ByteDance Seed: Seed-2.0-Mini
  calculator.registerPricing('openrouter/bytedance-seed/seed-2.0-mini', {
    inputTokensReadUncachedPPM: 0.1,
    outputTokensGeneratedPPM: 0.4,
  });
  // ByteDance: UI-TARS 7B
  calculator.registerPricing('openrouter/bytedance/ui-tars-1.5-7b', {
    inputTokensReadUncachedPPM: 0.1,
    inputTokensReadCachedPPM: 0.1,
    outputTokensGeneratedPPM: 0.2,
  });
  // Venice: Uncensored (free)
  calculator.registerPricing('openrouter/cognitivecomputations/dolphin-mistral-24b-venice-edition:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Cohere: Command A
  calculator.registerPricing('openrouter/cohere/command-a', {
    inputTokensReadUncachedPPM: 2.5,
    outputTokensGeneratedPPM: 10,
  });
}
