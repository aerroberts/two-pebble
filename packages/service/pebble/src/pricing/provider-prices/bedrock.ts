import type { PriceCalculator } from '../price-calculator';

// Pricing per million tokens (USD)
// Source: https://aws.amazon.com/bedrock/pricing/
// Bedrock pricing follows Anthropic tiers for Claude models
export function registerBedrockPricing(calculator: PriceCalculator) {
  registerBedrockClaudePricing(calculator);
  registerBedrockLegacyClaudePricing(calculator);
  registerBedrockOtherPricing(calculator);
}

function registerBedrockClaudePricing(calculator: PriceCalculator) {
  registerBedrockClaudeOpus45Pricing(calculator);
  registerBedrockClaudeOpus47Pricing(calculator);
  registerBedrockClaudeSonnet46Pricing(calculator);
  registerBedrockClaudeSonnet45Pricing(calculator);
  registerBedrockClaudeHaiku45Pricing(calculator);
  registerBedrockClaudeOpus41Pricing(calculator);
}

function registerBedrockClaudeOpus45Pricing(calculator: PriceCalculator) {
  // Claude Opus 4.5 (global endpoint)
  calculator.registerPricing('bedrock/global.anthropic.claude-opus-4-5-20251101-v1:0', {
    inputTokensReadUncachedPPM: 5.0,
    inputTokensReadCachedPPM: 0.5,
    inputTokensWriteCachedPPM: 6.25,
    outputTokensGeneratedPPM: 25.0,
  });
  calculator.registerPricing('bedrock/global.anthropic.claude-opus-4-5-20251101-v1:0', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 10.0,
    inputTokensReadCachedPPM: 1.0,
    inputTokensWriteCachedPPM: 12.5,
    outputTokensGeneratedPPM: 50.0,
  });

  // Claude Opus 4.5 (US cross-region endpoint)
  calculator.registerPricing('bedrock/us.anthropic.claude-opus-4-5-20251101-v1:0', {
    inputTokensReadUncachedPPM: 5.0,
    inputTokensReadCachedPPM: 0.5,
    inputTokensWriteCachedPPM: 6.25,
    outputTokensGeneratedPPM: 25.0,
  });
  calculator.registerPricing('bedrock/us.anthropic.claude-opus-4-5-20251101-v1:0', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 10.0,
    inputTokensReadCachedPPM: 1.0,
    inputTokensWriteCachedPPM: 12.5,
    outputTokensGeneratedPPM: 50.0,
  });

  // Claude Opus 4.5 (regional endpoint, 10% premium)
  calculator.registerPricing('bedrock/anthropic.claude-opus-4-5-20251101-v1:0', {
    inputTokensReadUncachedPPM: 5.5,
    inputTokensReadCachedPPM: 0.55,
    inputTokensWriteCachedPPM: 6.875,
    outputTokensGeneratedPPM: 27.5,
  });
  calculator.registerPricing('bedrock/anthropic.claude-opus-4-5-20251101-v1:0', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 11.0,
    inputTokensReadCachedPPM: 1.1,
    inputTokensWriteCachedPPM: 13.75,
    outputTokensGeneratedPPM: 55.0,
  });
}

function registerBedrockClaudeOpus47Pricing(calculator: PriceCalculator) {
  // Claude Opus 4.7 (global endpoint, standard pricing across full 1M context)
  calculator.registerPricing('bedrock/global.anthropic.claude-opus-4-7', {
    inputTokensReadUncachedPPM: 5.0,
    inputTokensReadCachedPPM: 0.5,
    inputTokensWriteCachedPPM: 6.25,
    outputTokensGeneratedPPM: 25.0,
  });

  // Claude Opus 4.7 (US cross-region endpoint, standard pricing across full 1M context)
  calculator.registerPricing('bedrock/us.anthropic.claude-opus-4-7', {
    inputTokensReadUncachedPPM: 5.0,
    inputTokensReadCachedPPM: 0.5,
    inputTokensWriteCachedPPM: 6.25,
    outputTokensGeneratedPPM: 25.0,
  });

  // Claude Opus 4.7 (regional endpoint, 10% premium)
  calculator.registerPricing('bedrock/anthropic.claude-opus-4-7', {
    inputTokensReadUncachedPPM: 5.5,
    inputTokensReadCachedPPM: 0.55,
    inputTokensWriteCachedPPM: 6.875,
    outputTokensGeneratedPPM: 27.5,
  });

  // Claude Opus 4.6 (global endpoint, standard pricing across full 1M context)
  calculator.registerPricing('bedrock/global.anthropic.claude-opus-4-6-v1', {
    inputTokensReadUncachedPPM: 5.0,
    inputTokensReadCachedPPM: 0.5,
    inputTokensWriteCachedPPM: 6.25,
    outputTokensGeneratedPPM: 25.0,
  });

  // Claude Opus 4.6 (US cross-region endpoint, standard pricing across full 1M context)
  calculator.registerPricing('bedrock/us.anthropic.claude-opus-4-6-v1', {
    inputTokensReadUncachedPPM: 5.0,
    inputTokensReadCachedPPM: 0.5,
    inputTokensWriteCachedPPM: 6.25,
    outputTokensGeneratedPPM: 25.0,
  });

  // Claude Opus 4.6 (regional endpoint, 10% premium)
  calculator.registerPricing('bedrock/anthropic.claude-opus-4-6-v1', {
    inputTokensReadUncachedPPM: 5.5,
    inputTokensReadCachedPPM: 0.55,
    inputTokensWriteCachedPPM: 6.875,
    outputTokensGeneratedPPM: 27.5,
  });
}

function registerBedrockClaudeSonnet46Pricing(calculator: PriceCalculator) {
  // Claude Sonnet 4.6 (global endpoint)
  calculator.registerPricing('bedrock/global.anthropic.claude-sonnet-4-6', {
    inputTokensReadUncachedPPM: 3.0,
    inputTokensReadCachedPPM: 0.3,
    inputTokensWriteCachedPPM: 3.75,
    outputTokensGeneratedPPM: 15.0,
  });
  calculator.registerPricing('bedrock/global.anthropic.claude-sonnet-4-6', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 6.0,
    inputTokensReadCachedPPM: 0.6,
    inputTokensWriteCachedPPM: 7.5,
    outputTokensGeneratedPPM: 30.0,
  });

  // Claude Sonnet 4.6 (US cross-region endpoint)
  calculator.registerPricing('bedrock/us.anthropic.claude-sonnet-4-6', {
    inputTokensReadUncachedPPM: 3.0,
    inputTokensReadCachedPPM: 0.3,
    inputTokensWriteCachedPPM: 3.75,
    outputTokensGeneratedPPM: 15.0,
  });
  calculator.registerPricing('bedrock/us.anthropic.claude-sonnet-4-6', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 6.0,
    inputTokensReadCachedPPM: 0.6,
    inputTokensWriteCachedPPM: 7.5,
    outputTokensGeneratedPPM: 30.0,
  });

  // Claude Sonnet 4.6 (regional endpoint, 10% premium)
  calculator.registerPricing('bedrock/anthropic.claude-sonnet-4-6', {
    inputTokensReadUncachedPPM: 3.3,
    inputTokensReadCachedPPM: 0.33,
    inputTokensWriteCachedPPM: 4.125,
    outputTokensGeneratedPPM: 16.5,
  });
  calculator.registerPricing('bedrock/anthropic.claude-sonnet-4-6', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 6.6,
    inputTokensReadCachedPPM: 0.66,
    inputTokensWriteCachedPPM: 8.25,
    outputTokensGeneratedPPM: 33.0,
  });
}

function registerBedrockClaudeSonnet45Pricing(calculator: PriceCalculator) {
  // Claude Sonnet 4.5 (global endpoint)
  calculator.registerPricing('bedrock/global.anthropic.claude-sonnet-4-5-20250929-v1:0', {
    inputTokensReadUncachedPPM: 3.0,
    inputTokensReadCachedPPM: 0.3,
    inputTokensWriteCachedPPM: 3.75,
    outputTokensGeneratedPPM: 15.0,
  });
  calculator.registerPricing('bedrock/global.anthropic.claude-sonnet-4-5-20250929-v1:0', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 6.0,
    inputTokensReadCachedPPM: 0.6,
    inputTokensWriteCachedPPM: 7.5,
    outputTokensGeneratedPPM: 30.0,
  });

  // Claude Sonnet 4.5 (US cross-region endpoint)
  calculator.registerPricing('bedrock/us.anthropic.claude-sonnet-4-5-20250929-v1:0', {
    inputTokensReadUncachedPPM: 3.0,
    inputTokensReadCachedPPM: 0.3,
    inputTokensWriteCachedPPM: 3.75,
    outputTokensGeneratedPPM: 15.0,
  });
  calculator.registerPricing('bedrock/us.anthropic.claude-sonnet-4-5-20250929-v1:0', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 6.0,
    inputTokensReadCachedPPM: 0.6,
    inputTokensWriteCachedPPM: 7.5,
    outputTokensGeneratedPPM: 30.0,
  });

  // Claude Sonnet 4.5 (regional endpoint, 10% premium)
  calculator.registerPricing('bedrock/anthropic.claude-sonnet-4-5-20250929-v1:0', {
    inputTokensReadUncachedPPM: 3.3,
    inputTokensReadCachedPPM: 0.33,
    inputTokensWriteCachedPPM: 4.125,
    outputTokensGeneratedPPM: 16.5,
  });
  calculator.registerPricing('bedrock/anthropic.claude-sonnet-4-5-20250929-v1:0', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 6.6,
    inputTokensReadCachedPPM: 0.66,
    inputTokensWriteCachedPPM: 8.25,
    outputTokensGeneratedPPM: 33.0,
  });
}

function registerBedrockClaudeHaiku45Pricing(calculator: PriceCalculator) {
  // Claude Haiku 4.5 (US cross-region endpoint)
  calculator.registerPricing('bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0', {
    inputTokensReadUncachedPPM: 1.0,
    inputTokensReadCachedPPM: 0.1,
    inputTokensWriteCachedPPM: 1.25,
    outputTokensGeneratedPPM: 5.0,
  });
  calculator.registerPricing('bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 2.0,
    inputTokensReadCachedPPM: 0.2,
    inputTokensWriteCachedPPM: 2.5,
    outputTokensGeneratedPPM: 10.0,
  });

  // Claude Haiku 4.5
  calculator.registerPricing('bedrock/anthropic.claude-haiku-4-5-20251001-v1:0', {
    inputTokensReadUncachedPPM: 1.0,
    inputTokensReadCachedPPM: 0.1,
    inputTokensWriteCachedPPM: 1.25,
    outputTokensGeneratedPPM: 5.0,
  });
  calculator.registerPricing('bedrock/anthropic.claude-haiku-4-5-20251001-v1:0', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 2.0,
    inputTokensReadCachedPPM: 0.2,
    inputTokensWriteCachedPPM: 2.5,
    outputTokensGeneratedPPM: 10.0,
  });
}

function registerBedrockClaudeOpus41Pricing(calculator: PriceCalculator) {
  // Claude Opus 4.1
  calculator.registerPricing('bedrock/anthropic.claude-opus-4-1-20250805-v1:0', {
    inputTokensReadUncachedPPM: 15.0,
    inputTokensReadCachedPPM: 1.5,
    inputTokensWriteCachedPPM: 18.75,
    outputTokensGeneratedPPM: 75.0,
  });
  calculator.registerPricing('bedrock/anthropic.claude-opus-4-1-20250805-v1:0', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 30.0,
    inputTokensReadCachedPPM: 3.0,
    inputTokensWriteCachedPPM: 37.5,
    outputTokensGeneratedPPM: 150.0,
  });
}

function registerBedrockLegacyClaudePricing(calculator: PriceCalculator) {
  // Claude 3.5 Sonnet
  calculator.registerPricing('bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0', {
    inputTokensReadUncachedPPM: 3.0,
    inputTokensReadCachedPPM: 0.3,
    inputTokensWriteCachedPPM: 3.75,
    outputTokensGeneratedPPM: 15.0,
  });
  calculator.registerPricing('bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 6.0,
    inputTokensReadCachedPPM: 0.6,
    inputTokensWriteCachedPPM: 7.5,
    outputTokensGeneratedPPM: 30.0,
  });

  // Claude 3.5 Haiku
  calculator.registerPricing('bedrock/anthropic.claude-3-5-haiku-20241022-v1:0', {
    inputTokensReadUncachedPPM: 1.0,
    inputTokensReadCachedPPM: 0.1,
    inputTokensWriteCachedPPM: 1.25,
    outputTokensGeneratedPPM: 5.0,
  });
  calculator.registerPricing('bedrock/anthropic.claude-3-5-haiku-20241022-v1:0', {
    inputTokensTier: 200_001,
    inputTokensReadUncachedPPM: 2.0,
    inputTokensReadCachedPPM: 0.2,
    inputTokensWriteCachedPPM: 2.5,
    outputTokensGeneratedPPM: 10.0,
  });

  // Claude 3 Opus (no caching, no tiered pricing on Bedrock)
  calculator.registerPricing('bedrock/anthropic.claude-3-opus-20240229-v1:0', {
    inputTokensReadUncachedPPM: 15.0,
    outputTokensGeneratedPPM: 75.0,
  });

  // Claude 3 Sonnet (no caching)
  calculator.registerPricing('bedrock/anthropic.claude-3-sonnet-20240229-v1:0', {
    inputTokensReadUncachedPPM: 3.0,
    outputTokensGeneratedPPM: 15.0,
  });

  // Claude 3 Haiku (no caching)
  calculator.registerPricing('bedrock/anthropic.claude-3-haiku-20240307-v1:0', {
    inputTokensReadUncachedPPM: 0.25,
    outputTokensGeneratedPPM: 1.25,
  });

  // Claude v2.1
  calculator.registerPricing('bedrock/anthropic.claude-v2:1', {
    inputTokensReadUncachedPPM: 8.0,
    outputTokensGeneratedPPM: 24.0,
  });

  // Claude v2
  calculator.registerPricing('bedrock/anthropic.claude-v2', {
    inputTokensReadUncachedPPM: 8.0,
    outputTokensGeneratedPPM: 24.0,
  });

  // Claude Instant v1
  calculator.registerPricing('bedrock/anthropic.claude-instant-v1', {
    inputTokensReadUncachedPPM: 0.8,
    outputTokensGeneratedPPM: 2.4,
  });
}

function registerBedrockOtherPricing(calculator: PriceCalculator) {
  // GPT OSS models (Amazon's open-source models)
  calculator.registerPricing('bedrock/gpt-oss-20b', {
    inputTokensReadUncachedPPM: 0.07,
    outputTokensGeneratedPPM: 0.3,
  });

  calculator.registerPricing('bedrock/gpt-oss-120b', {
    inputTokensReadUncachedPPM: 0.15,
    outputTokensGeneratedPPM: 0.6,
  });
}
