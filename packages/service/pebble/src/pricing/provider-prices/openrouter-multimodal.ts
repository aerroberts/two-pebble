import type { PriceCalculator } from '../price-calculator';

/**
 * Manual pricing for OpenRouter speech/transcription models that are not picked
 * up by the auto-generated openrouter.ts chat catalog. Speech models bill
 * per-character (treated as one inputTokensReadUncached unit per char), so the
 * PPM values here are "per million characters." Transcription models bill in
 * tokens (input audio + output text). Rates mirror the upstream provider's
 * published price; OpenRouter's markup is small enough to ignore at this
 * resolution.
 */
export function registerOpenRouterMultimodalPricing(calculator: PriceCalculator) {
  // OpenAI gpt-4o-mini-tts via OpenRouter. The dated variant is what
  // OpenRouter currently exposes; the un-dated slug 404s.
  calculator.registerPricing('openrouter/openai/gpt-4o-mini-tts-2025-12-15', {
    inputTokensReadUncachedPPM: 0.6,
  });

  // OpenAI gpt-4o-transcribe via OpenRouter. Not surfaced by /api/v1/models
  // (audio endpoint), so cost tracking stays unavailable until registered here.
  // Source: https://openrouter.ai/openai/gpt-4o-transcribe
  calculator.registerPricing('openrouter/openai/gpt-4o-transcribe', {
    inputTokensReadUncachedPPM: 2.5,
    outputTokensGeneratedPPM: 10.0,
  });
}
