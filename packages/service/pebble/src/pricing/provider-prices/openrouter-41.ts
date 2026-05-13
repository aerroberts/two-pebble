// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart41(calculator: PriceCalculator) {
  // Sao10k: Llama 3 Euryale 70B v2.1
  calculator.registerPricing('openrouter/sao10k/l3-euryale-70b', {
    inputTokensReadUncachedPPM: 1.48,
    outputTokensGeneratedPPM: 1.48,
  });
  // Sao10K: Llama 3 8B Lunaris
  calculator.registerPricing('openrouter/sao10k/l3-lunaris-8b', {
    inputTokensReadUncachedPPM: 0.04,
    outputTokensGeneratedPPM: 0.05,
  });
  // Sao10K: Llama 3.1 70B Hanami x1
  calculator.registerPricing('openrouter/sao10k/l3.1-70b-hanami-x1', {
    inputTokensReadUncachedPPM: 3,
    outputTokensGeneratedPPM: 3,
  });
  // Sao10K: Llama 3.1 Euryale 70B v2.2
  calculator.registerPricing('openrouter/sao10k/l3.1-euryale-70b', {
    inputTokensReadUncachedPPM: 0.85,
    outputTokensGeneratedPPM: 0.85,
  });
  // Sao10K: Llama 3.3 Euryale 70B
  calculator.registerPricing('openrouter/sao10k/l3.3-euryale-70b', {
    inputTokensReadUncachedPPM: 0.65,
    outputTokensGeneratedPPM: 0.75,
  });
  // StepFun: Step 3.5 Flash
  calculator.registerPricing('openrouter/stepfun/step-3.5-flash', {
    inputTokensReadUncachedPPM: 0.1,
    outputTokensGeneratedPPM: 0.3,
  });
  // Switchpoint Router
  calculator.registerPricing('openrouter/switchpoint/router', {
    inputTokensReadUncachedPPM: 0.85,
    outputTokensGeneratedPPM: 3.4,
  });
  // Tencent: Hunyuan A13B Instruct
  calculator.registerPricing('openrouter/tencent/hunyuan-a13b-instruct', {
    inputTokensReadUncachedPPM: 0.14,
    outputTokensGeneratedPPM: 0.57,
  });
}
