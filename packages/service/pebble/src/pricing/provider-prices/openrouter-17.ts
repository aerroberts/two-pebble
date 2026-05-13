// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart17(calculator: PriceCalculator) {
  // Meta: Llama Guard 4 12B
  calculator.registerPricing('openrouter/meta-llama/llama-guard-4-12b', {
    inputTokensReadUncachedPPM: 0.18,
    outputTokensGeneratedPPM: 0.18,
  });
  // Microsoft: Phi 4
  calculator.registerPricing('openrouter/microsoft/phi-4', {
    inputTokensReadUncachedPPM: 0.065,
    outputTokensGeneratedPPM: 0.14,
  });
  // Microsoft: Phi 4 Mini Instruct
  calculator.registerPricing('openrouter/microsoft/phi-4-mini-instruct', {
    inputTokensReadUncachedPPM: 0.08,
    inputTokensReadCachedPPM: 0.08,
    outputTokensGeneratedPPM: 0.35,
  });
  // WizardLM-2 8x22B
  calculator.registerPricing('openrouter/microsoft/wizardlm-2-8x22b', {
    inputTokensReadUncachedPPM: 0.62,
    outputTokensGeneratedPPM: 0.62,
  });
  // MiniMax: MiniMax-01
  calculator.registerPricing('openrouter/minimax/minimax-01', {
    inputTokensReadUncachedPPM: 0.2,
    outputTokensGeneratedPPM: 1.1,
  });
  // MiniMax: MiniMax M1
  calculator.registerPricing('openrouter/minimax/minimax-m1', {
    inputTokensReadUncachedPPM: 0.4,
    outputTokensGeneratedPPM: 2.2,
  });
  // MiniMax: MiniMax M2
  calculator.registerPricing('openrouter/minimax/minimax-m2', {
    inputTokensReadUncachedPPM: 0.255,
    inputTokensReadCachedPPM: 0.03,
    outputTokensGeneratedPPM: 1,
  });
  // MiniMax: MiniMax M2-her
  calculator.registerPricing('openrouter/minimax/minimax-m2-her', {
    inputTokensReadUncachedPPM: 0.3,
    inputTokensReadCachedPPM: 0.03,
    outputTokensGeneratedPPM: 1.2,
  });
}
