import type { PriceCalculator } from '../price-calculator';

// Pricing per million tokens (USD)
// Source: https://platform.claude.com/docs/en/about-claude/models/overview

export function registerAnthropicPricing(calculator: PriceCalculator) {
  // Claude Opus 4.8
  calculator.registerPricing('anthropic/claude-opus-4-8', {
    inputTokensReadUncachedPPM: 5.0,
    inputTokensReadCachedPPM: 0.5,
    inputTokensWriteCachedPPM: 6.25,
    outputTokensGeneratedPPM: 25.0,
  });

  // Claude Sonnet 4.5
  calculator.registerPricing('anthropic/claude-sonnet-4-5-20250929', {
    inputTokensReadUncachedPPM: 3.0,
    inputTokensReadCachedPPM: 0.3,
    inputTokensWriteCachedPPM: 3.75,
    outputTokensGeneratedPPM: 15.0,
  });
  calculator.registerPricing('anthropic/claude-sonnet-4-5-20250929', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 6.0,
    inputTokensReadCachedPPM: 0.6,
    inputTokensWriteCachedPPM: 7.5,
    outputTokensGeneratedPPM: 30.0,
  });

  calculator.registerPricing('anthropic/claude-sonnet-4-5', {
    inputTokensReadUncachedPPM: 3.0,
    inputTokensReadCachedPPM: 0.3,
    inputTokensWriteCachedPPM: 3.75,
    outputTokensGeneratedPPM: 15.0,
  });
  calculator.registerPricing('anthropic/claude-sonnet-4-5', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 6.0,
    inputTokensReadCachedPPM: 0.6,
    inputTokensWriteCachedPPM: 7.5,
    outputTokensGeneratedPPM: 30.0,
  });

  // Claude Sonnet 4.6
  calculator.registerPricing('anthropic/claude-sonnet-4-6', {
    inputTokensReadUncachedPPM: 3.0,
    inputTokensReadCachedPPM: 0.3,
    inputTokensWriteCachedPPM: 3.75,
    outputTokensGeneratedPPM: 15.0,
  });
  calculator.registerPricing('anthropic/claude-sonnet-4-6', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 6.0,
    inputTokensReadCachedPPM: 0.6,
    inputTokensWriteCachedPPM: 7.5,
    outputTokensGeneratedPPM: 30.0,
  });

  // Claude Sonnet 4
  calculator.registerPricing('anthropic/claude-sonnet-4-20250514', {
    inputTokensReadUncachedPPM: 3.0,
    inputTokensReadCachedPPM: 0.3,
    inputTokensWriteCachedPPM: 3.75,
    outputTokensGeneratedPPM: 15.0,
  });
  calculator.registerPricing('anthropic/claude-sonnet-4-20250514', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 6.0,
    inputTokensReadCachedPPM: 0.6,
    inputTokensWriteCachedPPM: 7.5,
    outputTokensGeneratedPPM: 30.0,
  });

  calculator.registerPricing('anthropic/claude-sonnet-4', {
    inputTokensReadUncachedPPM: 3.0,
    inputTokensReadCachedPPM: 0.3,
    inputTokensWriteCachedPPM: 3.75,
    outputTokensGeneratedPPM: 15.0,
  });
  calculator.registerPricing('anthropic/claude-sonnet-4', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 6.0,
    inputTokensReadCachedPPM: 0.6,
    inputTokensWriteCachedPPM: 7.5,
    outputTokensGeneratedPPM: 30.0,
  });

  // Claude Haiku 4.5
  calculator.registerPricing('anthropic/claude-haiku-4-5-20251001', {
    inputTokensReadUncachedPPM: 1.0,
    inputTokensReadCachedPPM: 0.1,
    inputTokensWriteCachedPPM: 1.25,
    outputTokensGeneratedPPM: 5.0,
  });
  calculator.registerPricing('anthropic/claude-haiku-4-5-20251001', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 2.0,
    inputTokensReadCachedPPM: 0.2,
    inputTokensWriteCachedPPM: 2.5,
    outputTokensGeneratedPPM: 10.0,
  });

  calculator.registerPricing('anthropic/claude-haiku-4-5', {
    inputTokensReadUncachedPPM: 1.0,
    inputTokensReadCachedPPM: 0.1,
    inputTokensWriteCachedPPM: 1.25,
    outputTokensGeneratedPPM: 5.0,
  });
  calculator.registerPricing('anthropic/claude-haiku-4-5', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 2.0,
    inputTokensReadCachedPPM: 0.2,
    inputTokensWriteCachedPPM: 2.5,
    outputTokensGeneratedPPM: 10.0,
  });

  // Claude Opus 4.7
  calculator.registerPricing('anthropic/claude-opus-4-7', {
    inputTokensReadUncachedPPM: 5.0,
    inputTokensReadCachedPPM: 0.5,
    inputTokensWriteCachedPPM: 6.25,
    outputTokensGeneratedPPM: 25.0,
  });

  // Claude Opus 4.6
  calculator.registerPricing('anthropic/claude-opus-4-6', {
    inputTokensReadUncachedPPM: 5.0,
    inputTokensReadCachedPPM: 0.5,
    inputTokensWriteCachedPPM: 6.25,
    outputTokensGeneratedPPM: 25.0,
  });

  // Claude Opus 4.5
  calculator.registerPricing('anthropic/claude-opus-4-5-20251101', {
    inputTokensReadUncachedPPM: 5.0,
    inputTokensReadCachedPPM: 0.5,
    inputTokensWriteCachedPPM: 6.25,
    outputTokensGeneratedPPM: 25.0,
  });
  calculator.registerPricing('anthropic/claude-opus-4-5-20251101', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 10.0,
    inputTokensReadCachedPPM: 1.0,
    inputTokensWriteCachedPPM: 12.5,
    outputTokensGeneratedPPM: 50.0,
  });

  calculator.registerPricing('anthropic/claude-opus-4-5', {
    inputTokensReadUncachedPPM: 5.0,
    inputTokensReadCachedPPM: 0.5,
    inputTokensWriteCachedPPM: 6.25,
    outputTokensGeneratedPPM: 25.0,
  });
  calculator.registerPricing('anthropic/claude-opus-4-5', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 10.0,
    inputTokensReadCachedPPM: 1.0,
    inputTokensWriteCachedPPM: 12.5,
    outputTokensGeneratedPPM: 50.0,
  });

  // Claude Opus 4.1
  calculator.registerPricing('anthropic/claude-opus-4-1-20250805', {
    inputTokensReadUncachedPPM: 15.0,
    inputTokensReadCachedPPM: 1.5,
    inputTokensWriteCachedPPM: 18.75,
    outputTokensGeneratedPPM: 75.0,
  });
  calculator.registerPricing('anthropic/claude-opus-4-1-20250805', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 30.0,
    inputTokensReadCachedPPM: 3.0,
    inputTokensWriteCachedPPM: 37.5,
    outputTokensGeneratedPPM: 150.0,
  });

  calculator.registerPricing('anthropic/claude-opus-4-1', {
    inputTokensReadUncachedPPM: 15.0,
    inputTokensReadCachedPPM: 1.5,
    inputTokensWriteCachedPPM: 18.75,
    outputTokensGeneratedPPM: 75.0,
  });
  calculator.registerPricing('anthropic/claude-opus-4-1', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 30.0,
    inputTokensReadCachedPPM: 3.0,
    inputTokensWriteCachedPPM: 37.5,
    outputTokensGeneratedPPM: 150.0,
  });
}
