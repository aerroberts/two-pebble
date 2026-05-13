// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricingPart33(calculator: PriceCalculator) {
  // Pareto Code Router
  calculator.registerPricing('openrouter/openrouter/pareto-code', {
    inputTokensReadUncachedPPM: -1000000,
    outputTokensGeneratedPPM: -1000000,
  });
  // Perplexity: Sonar
  calculator.registerPricing('openrouter/perplexity/sonar', {
    inputTokensReadUncachedPPM: 1,
    outputTokensGeneratedPPM: 1,
  });
  // Perplexity: Sonar Deep Research
  calculator.registerPricing('openrouter/perplexity/sonar-deep-research', {
    inputTokensReadUncachedPPM: 2,
    outputTokensGeneratedPPM: 8,
  });
  // Perplexity: Sonar Pro
  calculator.registerPricing('openrouter/perplexity/sonar-pro', {
    inputTokensReadUncachedPPM: 3,
    outputTokensGeneratedPPM: 15,
  });
  // Perplexity: Sonar Pro Search
  calculator.registerPricing('openrouter/perplexity/sonar-pro-search', {
    inputTokensReadUncachedPPM: 3,
    outputTokensGeneratedPPM: 15,
  });
  // Perplexity: Sonar Reasoning Pro
  calculator.registerPricing('openrouter/perplexity/sonar-reasoning-pro', {
    inputTokensReadUncachedPPM: 2,
    outputTokensGeneratedPPM: 8,
  });
  // Poolside: Laguna M.1 (free)
  calculator.registerPricing('openrouter/poolside/laguna-m.1:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Poolside: Laguna XS.2 (free)
  calculator.registerPricing('openrouter/poolside/laguna-xs.2:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
}
