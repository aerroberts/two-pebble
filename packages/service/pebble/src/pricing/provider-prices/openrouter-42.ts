// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart42(calculator: PriceCalculator) {
  // Tencent: Hy3 preview
  calculator.registerPricing('openrouter/tencent/hy3-preview', {
    inputTokensReadUncachedPPM: 0.066,
    inputTokensReadCachedPPM: 0.029,
    outputTokensGeneratedPPM: 0.26,
  });
  // TheDrummer: Cydonia 24B V4.1
  calculator.registerPricing('openrouter/thedrummer/cydonia-24b-v4.1', {
    inputTokensReadUncachedPPM: 0.3,
    inputTokensReadCachedPPM: 0.15,
    outputTokensGeneratedPPM: 0.5,
  });
  // TheDrummer: Rocinante 12B
  calculator.registerPricing('openrouter/thedrummer/rocinante-12b', {
    inputTokensReadUncachedPPM: 0.17,
    outputTokensGeneratedPPM: 0.43,
  });
  // TheDrummer: Skyfall 36B V2
  calculator.registerPricing('openrouter/thedrummer/skyfall-36b-v2', {
    inputTokensReadUncachedPPM: 0.55,
    inputTokensReadCachedPPM: 0.25,
    outputTokensGeneratedPPM: 0.8,
  });
  // TheDrummer: UnslopNemo 12B
  calculator.registerPricing('openrouter/thedrummer/unslopnemo-12b', {
    inputTokensReadUncachedPPM: 0.4,
    outputTokensGeneratedPPM: 0.4,
  });
  // ReMM SLERP 13B
  calculator.registerPricing('openrouter/undi95/remm-slerp-l2-13b', {
    inputTokensReadUncachedPPM: 0.45,
    outputTokensGeneratedPPM: 0.65,
  });
  // Upstage: Solar Pro 3
  calculator.registerPricing('openrouter/upstage/solar-pro-3', {
    inputTokensReadUncachedPPM: 0.15,
    inputTokensReadCachedPPM: 0.015,
    outputTokensGeneratedPPM: 0.6,
  });
  // Writer: Palmyra X5
  calculator.registerPricing('openrouter/writer/palmyra-x5', {
    inputTokensReadUncachedPPM: 0.6,
    outputTokensGeneratedPPM: 6,
  });
}
