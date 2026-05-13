// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart24(calculator: PriceCalculator) {
  // NVIDIA: Nemotron Nano 12B 2 VL (free)
  calculator.registerPricing('openrouter/nvidia/nemotron-nano-12b-v2-vl:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // NVIDIA: Nemotron Nano 9B V2
  calculator.registerPricing('openrouter/nvidia/nemotron-nano-9b-v2', {
    inputTokensReadUncachedPPM: 0.04,
    outputTokensGeneratedPPM: 0.16,
  });
  // NVIDIA: Nemotron Nano 9B V2 (free)
  calculator.registerPricing('openrouter/nvidia/nemotron-nano-9b-v2:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // OpenAI: GPT-3.5 Turbo
  calculator.registerPricing('openrouter/openai/gpt-3.5-turbo', {
    inputTokensReadUncachedPPM: 0.5,
    outputTokensGeneratedPPM: 1.5,
  });
  // OpenAI: GPT-3.5 Turbo (older v0613)
  calculator.registerPricing('openrouter/openai/gpt-3.5-turbo-0613', {
    inputTokensReadUncachedPPM: 1,
    outputTokensGeneratedPPM: 2,
  });
  // OpenAI: GPT-3.5 Turbo 16k
  calculator.registerPricing('openrouter/openai/gpt-3.5-turbo-16k', {
    inputTokensReadUncachedPPM: 3,
    outputTokensGeneratedPPM: 4,
  });
  // OpenAI: GPT-3.5 Turbo Instruct
  calculator.registerPricing('openrouter/openai/gpt-3.5-turbo-instruct', {
    inputTokensReadUncachedPPM: 1.5,
    outputTokensGeneratedPPM: 2,
  });
  // OpenAI: GPT-4
  calculator.registerPricing('openrouter/openai/gpt-4', {
    inputTokensReadUncachedPPM: 30,
    outputTokensGeneratedPPM: 60,
  });
}
