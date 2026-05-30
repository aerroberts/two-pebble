import type { PriceCalculator } from '../price-calculator';

// Pricing per million tokens (USD) - Standard tier
// Source: https://platform.openai.com/docs/pricing
//
// OpenAI does NOT charge separately for cache writes (unlike Anthropic).
// Caching is automatic - you pay regular input price, tokens get cached for free,
// then you get 90% discount when reading from cache. So inputTokensWriteCachedPPM
// is intentionally omitted.
//
// Pro models (gpt-5-pro, gpt-5.2-pro) do NOT support prompt caching.
export function registerOpenAIPricing(calculator: PriceCalculator) {
  registerOpenAIPricingPart1(calculator);
  registerOpenAIPricingPart2(calculator);
}

function registerOpenAIPricingPart1(calculator: PriceCalculator) {
  // GPT-5
  calculator.registerPricing('openai/gpt-5', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    outputTokensGeneratedPPM: 10.0,
  });

  // GPT-5 Pro (no caching available)
  calculator.registerPricing('openai/gpt-5-pro', {
    inputTokensReadUncachedPPM: 15.0,
    outputTokensGeneratedPPM: 120.0,
  });

  // GPT-5 Mini
  calculator.registerPricing('openai/gpt-5-mini', {
    inputTokensReadUncachedPPM: 0.25,
    inputTokensReadCachedPPM: 0.025,
    outputTokensGeneratedPPM: 2.0,
  });

  // GPT-5 Nano
  calculator.registerPricing('openai/gpt-5-nano', {
    inputTokensReadUncachedPPM: 0.05,
    inputTokensReadCachedPPM: 0.005,
    outputTokensGeneratedPPM: 0.4,
  });

  // GPT-5 Codex
  calculator.registerPricing('openai/gpt-5-codex', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    outputTokensGeneratedPPM: 10.0,
  });

  // GPT-5.1
  calculator.registerPricing('openai/gpt-5.1', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    outputTokensGeneratedPPM: 10.0,
  });

  // GPT-5.1 Codex
  calculator.registerPricing('openai/gpt-5.1-codex', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    outputTokensGeneratedPPM: 10.0,
  });

  // GPT-5.1 Codex Mini
  calculator.registerPricing('openai/gpt-5.1-codex-mini', {
    inputTokensReadUncachedPPM: 0.25,
    inputTokensReadCachedPPM: 0.025,
    outputTokensGeneratedPPM: 2.0,
  });

  // GPT-5.1 Codex Max
  calculator.registerPricing('openai/gpt-5.1-codex-max', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    outputTokensGeneratedPPM: 10.0,
  });

  // GPT-5.2
  calculator.registerPricing('openai/gpt-5.2', {
    inputTokensReadUncachedPPM: 1.75,
    inputTokensReadCachedPPM: 0.175,
    outputTokensGeneratedPPM: 14.0,
  });

  // GPT-5.2 Codex
}

function registerOpenAIPricingPart2(calculator: PriceCalculator) {
  calculator.registerPricing('openai/gpt-5.2-codex', {
    inputTokensReadUncachedPPM: 1.75,
    inputTokensReadCachedPPM: 0.175,
    outputTokensGeneratedPPM: 14.0,
  });

  // GPT-5.2 Pro (no caching available)
  calculator.registerPricing('openai/gpt-5.2-pro', {
    inputTokensReadUncachedPPM: 21.0,
    outputTokensGeneratedPPM: 168.0,
  });

  // Text-to-speech (TTS). The speech provider treats each input character as
  // one inputTokensReadUncached unit, so PPM here is "per million characters."
  calculator.registerPricing('openai/tts-1', {
    inputTokensReadUncachedPPM: 15.0,
  });
  calculator.registerPricing('openai/tts-1-hd', {
    inputTokensReadUncachedPPM: 30.0,
  });
  // gpt-4o-mini-tts is officially priced per audio output token, but the speech
  // provider only emits the input character count, so we charge the input rate.
  // Audio output tokens are not billed downstream — consider this a floor estimate.
  calculator.registerPricing('openai/gpt-4o-mini-tts', {
    inputTokensReadUncachedPPM: 0.6,
  });

  // Transcription. Newer transcribe models bill in tokens (input audio + output text).
  // whisper-1 is intentionally absent: it bills per second and emits no usage block,
  // so there is no way to express it in this PPM-token schema.
  calculator.registerPricing('openai/gpt-4o-transcribe', {
    inputTokensReadUncachedPPM: 6.0,
    outputTokensGeneratedPPM: 10.0,
  });
  calculator.registerPricing('openai/gpt-4o-mini-transcribe', {
    inputTokensReadUncachedPPM: 3.0,
    outputTokensGeneratedPPM: 5.0,
  });
  calculator.registerPricing('openai/gpt-4o-transcribe-diarize', {
    inputTokensReadUncachedPPM: 6.0,
    outputTokensGeneratedPPM: 10.0,
  });
  calculator.registerPricing('openai/gpt-realtime-whisper', {
    inputTokensReadUncachedPPM: 6.0,
    outputTokensGeneratedPPM: 10.0,
  });
}
