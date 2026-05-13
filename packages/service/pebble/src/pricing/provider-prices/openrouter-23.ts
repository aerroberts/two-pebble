// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart23(calculator: PriceCalculator) {
  // Nous: Hermes 4 405B
  calculator.registerPricing('openrouter/nousresearch/hermes-4-405b', {
    inputTokensReadUncachedPPM: 1,
    outputTokensGeneratedPPM: 3,
  });
  // Nous: Hermes 4 70B
  calculator.registerPricing('openrouter/nousresearch/hermes-4-70b', {
    inputTokensReadUncachedPPM: 0.13,
    outputTokensGeneratedPPM: 0.4,
  });
  // NVIDIA: Llama 3.3 Nemotron Super 49B V1.5
  calculator.registerPricing('openrouter/nvidia/llama-3.3-nemotron-super-49b-v1.5', {
    inputTokensReadUncachedPPM: 0.1,
    outputTokensGeneratedPPM: 0.4,
  });
  // NVIDIA: Nemotron 3 Nano 30B A3B
  calculator.registerPricing('openrouter/nvidia/nemotron-3-nano-30b-a3b', {
    inputTokensReadUncachedPPM: 0.05,
    outputTokensGeneratedPPM: 0.2,
  });
  // NVIDIA: Nemotron 3 Nano 30B A3B (free)
  calculator.registerPricing('openrouter/nvidia/nemotron-3-nano-30b-a3b:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // NVIDIA: Nemotron 3 Nano Omni (free)
  calculator.registerPricing('openrouter/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // NVIDIA: Nemotron 3 Super
  calculator.registerPricing('openrouter/nvidia/nemotron-3-super-120b-a12b', {
    inputTokensReadUncachedPPM: 0.09,
    outputTokensGeneratedPPM: 0.45,
  });
  // NVIDIA: Nemotron 3 Super (free)
  calculator.registerPricing('openrouter/nvidia/nemotron-3-super-120b-a12b:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
}
