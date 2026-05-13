// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:
//   bun scripts/generate-openrouter-pricing.ts
//
// Source: https://openrouter.ai/api/v1/models
// Pricing is converted from per-token USD into per-million-token (PPM) USD.

import type { PriceCalculator } from '../price-calculator';

export function registerOpenRouterPricing(calculator: PriceCalculator) {
  // Anthropic Claude Haiku Latest
  calculator.registerPricing('openrouter/~anthropic/claude-haiku-latest', {
    inputTokensReadUncachedPPM: 1,
    inputTokensReadCachedPPM: 0.1,
    inputTokensWriteCachedPPM: 1.25,
    outputTokensGeneratedPPM: 5,
  });
  // Anthropic: Claude Opus Latest
  calculator.registerPricing('openrouter/~anthropic/claude-opus-latest', {
    inputTokensReadUncachedPPM: 5,
    inputTokensReadCachedPPM: 0.5,
    inputTokensWriteCachedPPM: 6.25,
    outputTokensGeneratedPPM: 25,
  });
  // Anthropic Claude Sonnet Latest
  calculator.registerPricing('openrouter/~anthropic/claude-sonnet-latest', {
    inputTokensReadUncachedPPM: 3,
    inputTokensReadCachedPPM: 0.3,
    inputTokensWriteCachedPPM: 3.75,
    outputTokensGeneratedPPM: 15,
  });
  // Google Gemini Flash Latest
  calculator.registerPricing('openrouter/~google/gemini-flash-latest', {
    inputTokensReadUncachedPPM: 0.5,
    inputTokensReadCachedPPM: 0.05,
    inputTokensWriteCachedPPM: 0.083333,
    outputTokensGeneratedPPM: 3,
  });
  // Google Gemini Pro Latest
  calculator.registerPricing('openrouter/~google/gemini-pro-latest', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.2,
    inputTokensWriteCachedPPM: 0.375,
    outputTokensGeneratedPPM: 12,
  });
  // MoonshotAI Kimi Latest
  calculator.registerPricing('openrouter/~moonshotai/kimi-latest', {
    inputTokensReadUncachedPPM: 0.75,
    inputTokensReadCachedPPM: 0.15,
    outputTokensGeneratedPPM: 3.5,
  });
  // OpenAI GPT Latest
  calculator.registerPricing('openrouter/~openai/gpt-latest', {
    inputTokensReadUncachedPPM: 5,
    inputTokensReadCachedPPM: 0.5,
    outputTokensGeneratedPPM: 30,
  });
  // OpenAI GPT Mini Latest
  calculator.registerPricing('openrouter/~openai/gpt-mini-latest', {
    inputTokensReadUncachedPPM: 0.75,
    inputTokensReadCachedPPM: 0.075,
    outputTokensGeneratedPPM: 4.5,
  });
  // AI21: Jamba Large 1.7
  calculator.registerPricing('openrouter/ai21/jamba-large-1.7', {
    inputTokensReadUncachedPPM: 2,
    outputTokensGeneratedPPM: 8,
  });
  // AionLabs: Aion-1.0
  calculator.registerPricing('openrouter/aion-labs/aion-1.0', {
    inputTokensReadUncachedPPM: 4,
    outputTokensGeneratedPPM: 8,
  });
  // AionLabs: Aion-1.0-Mini
  calculator.registerPricing('openrouter/aion-labs/aion-1.0-mini', {
    inputTokensReadUncachedPPM: 0.7,
    outputTokensGeneratedPPM: 1.4,
  });
  // AionLabs: Aion-2.0
  calculator.registerPricing('openrouter/aion-labs/aion-2.0', {
    inputTokensReadUncachedPPM: 0.8,
    inputTokensReadCachedPPM: 0.2,
    outputTokensGeneratedPPM: 1.6,
  });
  // AionLabs: Aion-RP 1.0 (8B)
  calculator.registerPricing('openrouter/aion-labs/aion-rp-llama-3.1-8b', {
    inputTokensReadUncachedPPM: 0.8,
    outputTokensGeneratedPPM: 1.6,
  });
  // AlfredPros: CodeLLaMa 7B Instruct Solidity
  calculator.registerPricing('openrouter/alfredpros/codellama-7b-instruct-solidity', {
    inputTokensReadUncachedPPM: 0.8,
    outputTokensGeneratedPPM: 1.2,
  });
  // Tongyi DeepResearch 30B A3B
  calculator.registerPricing('openrouter/alibaba/tongyi-deepresearch-30b-a3b', {
    inputTokensReadUncachedPPM: 0.09,
    inputTokensReadCachedPPM: 0.09,
    outputTokensGeneratedPPM: 0.45,
  });
  // AllenAI: Olmo 3 32B Think
  calculator.registerPricing('openrouter/allenai/olmo-3-32b-think', {
    inputTokensReadUncachedPPM: 0.15,
    outputTokensGeneratedPPM: 0.5,
  });
  // Goliath 120B
  calculator.registerPricing('openrouter/alpindale/goliath-120b', {
    inputTokensReadUncachedPPM: 3.75,
    outputTokensGeneratedPPM: 7.5,
  });
  // Amazon: Nova 2 Lite
  calculator.registerPricing('openrouter/amazon/nova-2-lite-v1', {
    inputTokensReadUncachedPPM: 0.3,
    outputTokensGeneratedPPM: 2.5,
  });
  // Amazon: Nova Lite 1.0
  calculator.registerPricing('openrouter/amazon/nova-lite-v1', {
    inputTokensReadUncachedPPM: 0.06,
    outputTokensGeneratedPPM: 0.24,
  });
  // Amazon: Nova Micro 1.0
  calculator.registerPricing('openrouter/amazon/nova-micro-v1', {
    inputTokensReadUncachedPPM: 0.035,
    outputTokensGeneratedPPM: 0.14,
  });
  // Amazon: Nova Premier 1.0
  calculator.registerPricing('openrouter/amazon/nova-premier-v1', {
    inputTokensReadUncachedPPM: 2.5,
    inputTokensReadCachedPPM: 0.625,
    outputTokensGeneratedPPM: 12.5,
  });
  // Amazon: Nova Pro 1.0
  calculator.registerPricing('openrouter/amazon/nova-pro-v1', {
    inputTokensReadUncachedPPM: 0.8,
    outputTokensGeneratedPPM: 3.2,
  });
  // Magnum v4 72B
  calculator.registerPricing('openrouter/anthracite-org/magnum-v4-72b', {
    inputTokensReadUncachedPPM: 3,
    outputTokensGeneratedPPM: 5,
  });
  // Anthropic: Claude 3 Haiku
  calculator.registerPricing('openrouter/anthropic/claude-3-haiku', {
    inputTokensReadUncachedPPM: 0.25,
    inputTokensReadCachedPPM: 0.03,
    inputTokensWriteCachedPPM: 0.3,
    outputTokensGeneratedPPM: 1.25,
  });
  // Anthropic: Claude 3.5 Haiku
  calculator.registerPricing('openrouter/anthropic/claude-3.5-haiku', {
    inputTokensReadUncachedPPM: 0.8,
    inputTokensReadCachedPPM: 0.08,
    inputTokensWriteCachedPPM: 1,
    outputTokensGeneratedPPM: 4,
  });
  // Anthropic: Claude Haiku 4.5
  calculator.registerPricing('openrouter/anthropic/claude-haiku-4.5', {
    inputTokensReadUncachedPPM: 1,
    inputTokensReadCachedPPM: 0.1,
    inputTokensWriteCachedPPM: 1.25,
    outputTokensGeneratedPPM: 5,
  });
  // Anthropic: Claude Opus 4
  calculator.registerPricing('openrouter/anthropic/claude-opus-4', {
    inputTokensReadUncachedPPM: 15,
    inputTokensReadCachedPPM: 1.5,
    inputTokensWriteCachedPPM: 18.75,
    outputTokensGeneratedPPM: 75,
  });
  // Anthropic: Claude Opus 4.1
  calculator.registerPricing('openrouter/anthropic/claude-opus-4.1', {
    inputTokensReadUncachedPPM: 15,
    inputTokensReadCachedPPM: 1.5,
    inputTokensWriteCachedPPM: 18.75,
    outputTokensGeneratedPPM: 75,
  });
  // Anthropic: Claude Opus 4.5
  calculator.registerPricing('openrouter/anthropic/claude-opus-4.5', {
    inputTokensReadUncachedPPM: 5,
    inputTokensReadCachedPPM: 0.5,
    inputTokensWriteCachedPPM: 6.25,
    outputTokensGeneratedPPM: 25,
  });
  // Anthropic: Claude Opus 4.6
  calculator.registerPricing('openrouter/anthropic/claude-opus-4.6', {
    inputTokensReadUncachedPPM: 5,
    inputTokensReadCachedPPM: 0.5,
    inputTokensWriteCachedPPM: 6.25,
    outputTokensGeneratedPPM: 25,
  });
  // Anthropic: Claude Opus 4.6 (Fast)
  calculator.registerPricing('openrouter/anthropic/claude-opus-4.6-fast', {
    inputTokensReadUncachedPPM: 30,
    inputTokensReadCachedPPM: 3,
    inputTokensWriteCachedPPM: 37.5,
    outputTokensGeneratedPPM: 150,
  });
  // Anthropic: Claude Opus 4.7
  calculator.registerPricing('openrouter/anthropic/claude-opus-4.7', {
    inputTokensReadUncachedPPM: 5,
    inputTokensReadCachedPPM: 0.5,
    inputTokensWriteCachedPPM: 6.25,
    outputTokensGeneratedPPM: 25,
  });
  // Anthropic: Claude Sonnet 4
  calculator.registerPricing('openrouter/anthropic/claude-sonnet-4', {
    inputTokensReadUncachedPPM: 3,
    inputTokensReadCachedPPM: 0.3,
    inputTokensWriteCachedPPM: 3.75,
    outputTokensGeneratedPPM: 15,
  });
  // Anthropic: Claude Sonnet 4.5
  calculator.registerPricing('openrouter/anthropic/claude-sonnet-4.5', {
    inputTokensReadUncachedPPM: 3,
    inputTokensReadCachedPPM: 0.3,
    inputTokensWriteCachedPPM: 3.75,
    outputTokensGeneratedPPM: 15,
  });
  // Anthropic: Claude Sonnet 4.6
  calculator.registerPricing('openrouter/anthropic/claude-sonnet-4.6', {
    inputTokensReadUncachedPPM: 3,
    inputTokensReadCachedPPM: 0.3,
    inputTokensWriteCachedPPM: 3.75,
    outputTokensGeneratedPPM: 15,
  });
  // Arcee AI: Coder Large
  calculator.registerPricing('openrouter/arcee-ai/coder-large', {
    inputTokensReadUncachedPPM: 0.5,
    outputTokensGeneratedPPM: 0.8,
  });
  // Arcee AI: Maestro Reasoning
  calculator.registerPricing('openrouter/arcee-ai/maestro-reasoning', {
    inputTokensReadUncachedPPM: 0.9,
    outputTokensGeneratedPPM: 3.3,
  });
  // Arcee AI: Spotlight
  calculator.registerPricing('openrouter/arcee-ai/spotlight', {
    inputTokensReadUncachedPPM: 0.18,
    outputTokensGeneratedPPM: 0.18,
  });
  // Arcee AI: Trinity Large Preview
  calculator.registerPricing('openrouter/arcee-ai/trinity-large-preview', {
    inputTokensReadUncachedPPM: 0.15,
    outputTokensGeneratedPPM: 0.45,
  });
  // Arcee AI: Trinity Large Thinking
  calculator.registerPricing('openrouter/arcee-ai/trinity-large-thinking', {
    inputTokensReadUncachedPPM: 0.22,
    inputTokensReadCachedPPM: 0.06,
    outputTokensGeneratedPPM: 0.85,
  });
  // Arcee AI: Trinity Mini
  calculator.registerPricing('openrouter/arcee-ai/trinity-mini', {
    inputTokensReadUncachedPPM: 0.045,
    outputTokensGeneratedPPM: 0.15,
  });
  // Arcee AI: Virtuoso Large
  calculator.registerPricing('openrouter/arcee-ai/virtuoso-large', {
    inputTokensReadUncachedPPM: 0.75,
    outputTokensGeneratedPPM: 1.2,
  });
  // Baidu Qianfan: CoBuddy (free)
  calculator.registerPricing('openrouter/baidu/cobuddy:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Baidu: ERNIE 4.5 21B A3B
  calculator.registerPricing('openrouter/baidu/ernie-4.5-21b-a3b', {
    inputTokensReadUncachedPPM: 0.07,
    outputTokensGeneratedPPM: 0.28,
  });
  // Baidu: ERNIE 4.5 21B A3B Thinking
  calculator.registerPricing('openrouter/baidu/ernie-4.5-21b-a3b-thinking', {
    inputTokensReadUncachedPPM: 0.07,
    outputTokensGeneratedPPM: 0.28,
  });
  // Baidu: ERNIE 4.5 300B A47B
  calculator.registerPricing('openrouter/baidu/ernie-4.5-300b-a47b', {
    inputTokensReadUncachedPPM: 0.28,
    outputTokensGeneratedPPM: 1.1,
  });
  // Baidu: ERNIE 4.5 VL 28B A3B
  calculator.registerPricing('openrouter/baidu/ernie-4.5-vl-28b-a3b', {
    inputTokensReadUncachedPPM: 0.14,
    outputTokensGeneratedPPM: 0.56,
  });
  // Baidu: ERNIE 4.5 VL 424B A47B
  calculator.registerPricing('openrouter/baidu/ernie-4.5-vl-424b-a47b', {
    inputTokensReadUncachedPPM: 0.42,
    outputTokensGeneratedPPM: 1.25,
  });
  // Baidu: Qianfan-OCR-Fast (free)
  calculator.registerPricing('openrouter/baidu/qianfan-ocr-fast:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // ByteDance Seed: Seed 1.6
  calculator.registerPricing('openrouter/bytedance-seed/seed-1.6', {
    inputTokensReadUncachedPPM: 0.25,
    outputTokensGeneratedPPM: 2,
  });
  // ByteDance Seed: Seed 1.6 Flash
  calculator.registerPricing('openrouter/bytedance-seed/seed-1.6-flash', {
    inputTokensReadUncachedPPM: 0.075,
    outputTokensGeneratedPPM: 0.3,
  });
  // ByteDance Seed: Seed-2.0-Lite
  calculator.registerPricing('openrouter/bytedance-seed/seed-2.0-lite', {
    inputTokensReadUncachedPPM: 0.25,
    outputTokensGeneratedPPM: 2,
  });
  // ByteDance Seed: Seed-2.0-Mini
  calculator.registerPricing('openrouter/bytedance-seed/seed-2.0-mini', {
    inputTokensReadUncachedPPM: 0.1,
    outputTokensGeneratedPPM: 0.4,
  });
  // ByteDance: UI-TARS 7B
  calculator.registerPricing('openrouter/bytedance/ui-tars-1.5-7b', {
    inputTokensReadUncachedPPM: 0.1,
    inputTokensReadCachedPPM: 0.1,
    outputTokensGeneratedPPM: 0.2,
  });
  // Venice: Uncensored (free)
  calculator.registerPricing('openrouter/cognitivecomputations/dolphin-mistral-24b-venice-edition:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Cohere: Command A
  calculator.registerPricing('openrouter/cohere/command-a', {
    inputTokensReadUncachedPPM: 2.5,
    outputTokensGeneratedPPM: 10,
  });
  // Cohere: Command R (08-2024)
  calculator.registerPricing('openrouter/cohere/command-r-08-2024', {
    inputTokensReadUncachedPPM: 0.15,
    outputTokensGeneratedPPM: 0.6,
  });
  // Cohere: Command R+ (08-2024)
  calculator.registerPricing('openrouter/cohere/command-r-plus-08-2024', {
    inputTokensReadUncachedPPM: 2.5,
    outputTokensGeneratedPPM: 10,
  });
  // Cohere: Command R7B (12-2024)
  calculator.registerPricing('openrouter/cohere/command-r7b-12-2024', {
    inputTokensReadUncachedPPM: 0.0375,
    outputTokensGeneratedPPM: 0.15,
  });
  // Deep Cogito: Cogito v2.1 671B
  calculator.registerPricing('openrouter/deepcogito/cogito-v2.1-671b', {
    inputTokensReadUncachedPPM: 1.25,
    outputTokensGeneratedPPM: 1.25,
  });
  // DeepSeek: DeepSeek V3
  calculator.registerPricing('openrouter/deepseek/deepseek-chat', {
    inputTokensReadUncachedPPM: 0.32,
    outputTokensGeneratedPPM: 0.89,
  });
  // DeepSeek: DeepSeek V3 0324
  calculator.registerPricing('openrouter/deepseek/deepseek-chat-v3-0324', {
    inputTokensReadUncachedPPM: 0.2,
    inputTokensReadCachedPPM: 0.135,
    outputTokensGeneratedPPM: 0.77,
  });
  // DeepSeek: DeepSeek V3.1
  calculator.registerPricing('openrouter/deepseek/deepseek-chat-v3.1', {
    inputTokensReadUncachedPPM: 0.15,
    outputTokensGeneratedPPM: 0.75,
  });
  // DeepSeek: R1
  calculator.registerPricing('openrouter/deepseek/deepseek-r1', {
    inputTokensReadUncachedPPM: 0.7,
    outputTokensGeneratedPPM: 2.5,
  });
  // DeepSeek: R1 0528
  calculator.registerPricing('openrouter/deepseek/deepseek-r1-0528', {
    inputTokensReadUncachedPPM: 0.5,
    inputTokensReadCachedPPM: 0.35,
    outputTokensGeneratedPPM: 2.15,
  });
  // DeepSeek: R1 Distill Llama 70B
  calculator.registerPricing('openrouter/deepseek/deepseek-r1-distill-llama-70b', {
    inputTokensReadUncachedPPM: 0.7,
    outputTokensGeneratedPPM: 0.8,
  });
  // DeepSeek: R1 Distill Qwen 32B
  calculator.registerPricing('openrouter/deepseek/deepseek-r1-distill-qwen-32b', {
    inputTokensReadUncachedPPM: 0.29,
    outputTokensGeneratedPPM: 0.29,
  });
  // DeepSeek: DeepSeek V3.1 Terminus
  calculator.registerPricing('openrouter/deepseek/deepseek-v3.1-terminus', {
    inputTokensReadUncachedPPM: 0.27,
    inputTokensReadCachedPPM: 0.13,
    outputTokensGeneratedPPM: 0.95,
  });
  // DeepSeek: DeepSeek V3.2
  calculator.registerPricing('openrouter/deepseek/deepseek-v3.2', {
    inputTokensReadUncachedPPM: 0.252,
    inputTokensReadCachedPPM: 0.0252,
    outputTokensGeneratedPPM: 0.378,
  });
  // DeepSeek: DeepSeek V3.2 Exp
  calculator.registerPricing('openrouter/deepseek/deepseek-v3.2-exp', {
    inputTokensReadUncachedPPM: 0.27,
    outputTokensGeneratedPPM: 0.41,
  });
  // DeepSeek: DeepSeek V3.2 Speciale
  calculator.registerPricing('openrouter/deepseek/deepseek-v3.2-speciale', {
    inputTokensReadUncachedPPM: 0.287,
    inputTokensReadCachedPPM: 0.058,
    outputTokensGeneratedPPM: 0.431,
  });
  // DeepSeek: DeepSeek V4 Flash
  calculator.registerPricing('openrouter/deepseek/deepseek-v4-flash', {
    inputTokensReadUncachedPPM: 0.14,
    inputTokensReadCachedPPM: 0.0028,
    outputTokensGeneratedPPM: 0.28,
  });
  // DeepSeek: DeepSeek V4 Pro
  calculator.registerPricing('openrouter/deepseek/deepseek-v4-pro', {
    inputTokensReadUncachedPPM: 0.435,
    inputTokensReadCachedPPM: 0.003625,
    outputTokensGeneratedPPM: 0.87,
  });
  // EssentialAI: Rnj 1 Instruct
  calculator.registerPricing('openrouter/essentialai/rnj-1-instruct', {
    inputTokensReadUncachedPPM: 0.15,
    outputTokensGeneratedPPM: 0.15,
  });
  // Google: Gemini 2.0 Flash
  calculator.registerPricing('openrouter/google/gemini-2.0-flash-001', {
    inputTokensReadUncachedPPM: 0.1,
    inputTokensReadCachedPPM: 0.025,
    inputTokensWriteCachedPPM: 0.083333,
    outputTokensGeneratedPPM: 0.4,
  });
  // Google: Gemini 2.0 Flash Lite
  calculator.registerPricing('openrouter/google/gemini-2.0-flash-lite-001', {
    inputTokensReadUncachedPPM: 0.075,
    outputTokensGeneratedPPM: 0.3,
  });
  // Google: Gemini 2.5 Flash
  calculator.registerPricing('openrouter/google/gemini-2.5-flash', {
    inputTokensReadUncachedPPM: 0.3,
    inputTokensReadCachedPPM: 0.03,
    inputTokensWriteCachedPPM: 0.083333,
    outputTokensGeneratedPPM: 2.5,
  });
  // Google: Nano Banana (Gemini 2.5 Flash Image)
  calculator.registerPricing('openrouter/google/gemini-2.5-flash-image', {
    inputTokensReadUncachedPPM: 0.3,
    inputTokensReadCachedPPM: 0.03,
    inputTokensWriteCachedPPM: 0.083333,
    outputTokensGeneratedPPM: 2.5,
  });
  // Google: Gemini 2.5 Flash Lite
  calculator.registerPricing('openrouter/google/gemini-2.5-flash-lite', {
    inputTokensReadUncachedPPM: 0.1,
    inputTokensReadCachedPPM: 0.01,
    inputTokensWriteCachedPPM: 0.083333,
    outputTokensGeneratedPPM: 0.4,
  });
  // Google: Gemini 2.5 Flash Lite Preview 09-2025
  calculator.registerPricing('openrouter/google/gemini-2.5-flash-lite-preview-09-2025', {
    inputTokensReadUncachedPPM: 0.1,
    inputTokensReadCachedPPM: 0.01,
    inputTokensWriteCachedPPM: 0.083333,
    outputTokensGeneratedPPM: 0.4,
  });
  // Google: Gemini 2.5 Pro
  calculator.registerPricing('openrouter/google/gemini-2.5-pro', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    inputTokensWriteCachedPPM: 0.375,
    outputTokensGeneratedPPM: 10,
  });
  // Google: Gemini 2.5 Pro Preview 06-05
  calculator.registerPricing('openrouter/google/gemini-2.5-pro-preview', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    inputTokensWriteCachedPPM: 0.375,
    outputTokensGeneratedPPM: 10,
  });
  // Google: Gemini 2.5 Pro Preview 05-06
  calculator.registerPricing('openrouter/google/gemini-2.5-pro-preview-05-06', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    inputTokensWriteCachedPPM: 0.375,
    outputTokensGeneratedPPM: 10,
  });
  // Google: Gemini 3 Flash Preview
  calculator.registerPricing('openrouter/google/gemini-3-flash-preview', {
    inputTokensReadUncachedPPM: 0.5,
    inputTokensReadCachedPPM: 0.05,
    inputTokensWriteCachedPPM: 0.083333,
    outputTokensGeneratedPPM: 3,
  });
  // Google: Nano Banana Pro (Gemini 3 Pro Image Preview)
  calculator.registerPricing('openrouter/google/gemini-3-pro-image-preview', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.2,
    inputTokensWriteCachedPPM: 0.375,
    outputTokensGeneratedPPM: 12,
  });
  // Google: Nano Banana 2 (Gemini 3.1 Flash Image Preview)
  calculator.registerPricing('openrouter/google/gemini-3.1-flash-image-preview', {
    inputTokensReadUncachedPPM: 0.5,
    outputTokensGeneratedPPM: 3,
  });
  // Google: Gemini 3.1 Flash Lite
  calculator.registerPricing('openrouter/google/gemini-3.1-flash-lite', {
    inputTokensReadUncachedPPM: 0.25,
    inputTokensReadCachedPPM: 0.025,
    inputTokensWriteCachedPPM: 0.083333,
    outputTokensGeneratedPPM: 1.5,
  });
  // Google: Gemini 3.1 Flash Lite Preview
  calculator.registerPricing('openrouter/google/gemini-3.1-flash-lite-preview', {
    inputTokensReadUncachedPPM: 0.25,
    inputTokensReadCachedPPM: 0.025,
    inputTokensWriteCachedPPM: 0.083333,
    outputTokensGeneratedPPM: 1.5,
  });
  // Google: Gemini 3.1 Pro Preview
  calculator.registerPricing('openrouter/google/gemini-3.1-pro-preview', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.2,
    inputTokensWriteCachedPPM: 0.375,
    outputTokensGeneratedPPM: 12,
  });
  // Google: Gemini 3.1 Pro Preview Custom Tools
  calculator.registerPricing('openrouter/google/gemini-3.1-pro-preview-customtools', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.2,
    inputTokensWriteCachedPPM: 0.375,
    outputTokensGeneratedPPM: 12,
  });
  // Google: Gemma 2 27B
  calculator.registerPricing('openrouter/google/gemma-2-27b-it', {
    inputTokensReadUncachedPPM: 0.65,
    outputTokensGeneratedPPM: 0.65,
  });
  // Google: Gemma 3 12B
  calculator.registerPricing('openrouter/google/gemma-3-12b-it', {
    inputTokensReadUncachedPPM: 0.04,
    outputTokensGeneratedPPM: 0.13,
  });
  // Google: Gemma 3 27B
  calculator.registerPricing('openrouter/google/gemma-3-27b-it', {
    inputTokensReadUncachedPPM: 0.08,
    outputTokensGeneratedPPM: 0.16,
  });
  // Google: Gemma 3 4B
  calculator.registerPricing('openrouter/google/gemma-3-4b-it', {
    inputTokensReadUncachedPPM: 0.04,
    outputTokensGeneratedPPM: 0.08,
  });
  // Google: Gemma 3n 4B
  calculator.registerPricing('openrouter/google/gemma-3n-e4b-it', {
    inputTokensReadUncachedPPM: 0.06,
    outputTokensGeneratedPPM: 0.12,
  });
  // Google: Gemma 4 26B A4B
  calculator.registerPricing('openrouter/google/gemma-4-26b-a4b-it', {
    inputTokensReadUncachedPPM: 0.06,
    outputTokensGeneratedPPM: 0.33,
  });
  // Google: Gemma 4 26B A4B  (free)
  calculator.registerPricing('openrouter/google/gemma-4-26b-a4b-it:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Google: Gemma 4 31B
  calculator.registerPricing('openrouter/google/gemma-4-31b-it', {
    inputTokensReadUncachedPPM: 0.13,
    outputTokensGeneratedPPM: 0.38,
  });
  // Google: Gemma 4 31B (free)
  calculator.registerPricing('openrouter/google/gemma-4-31b-it:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Google: Lyria 3 Clip Preview
  calculator.registerPricing('openrouter/google/lyria-3-clip-preview', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Google: Lyria 3 Pro Preview
  calculator.registerPricing('openrouter/google/lyria-3-pro-preview', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // MythoMax 13B
  calculator.registerPricing('openrouter/gryphe/mythomax-l2-13b', {
    inputTokensReadUncachedPPM: 0.06,
    outputTokensGeneratedPPM: 0.06,
  });
  // IBM: Granite 4.0 Micro
  calculator.registerPricing('openrouter/ibm-granite/granite-4.0-h-micro', {
    inputTokensReadUncachedPPM: 0.017,
    outputTokensGeneratedPPM: 0.11,
  });
  // IBM: Granite 4.1 8B
  calculator.registerPricing('openrouter/ibm-granite/granite-4.1-8b', {
    inputTokensReadUncachedPPM: 0.05,
    inputTokensReadCachedPPM: 0.05,
    outputTokensGeneratedPPM: 0.1,
  });
  // Inception: Mercury 2
  calculator.registerPricing('openrouter/inception/mercury-2', {
    inputTokensReadUncachedPPM: 0.25,
    inputTokensReadCachedPPM: 0.025,
    outputTokensGeneratedPPM: 0.75,
  });
  // inclusionAI: Ling-2.6-1T
  calculator.registerPricing('openrouter/inclusionai/ling-2.6-1t', {
    inputTokensReadUncachedPPM: 0.3,
    inputTokensReadCachedPPM: 0.06,
    outputTokensGeneratedPPM: 2.5,
  });
  // inclusionAI: Ling-2.6-flash
  calculator.registerPricing('openrouter/inclusionai/ling-2.6-flash', {
    inputTokensReadUncachedPPM: 0.08,
    inputTokensReadCachedPPM: 0.016,
    outputTokensGeneratedPPM: 0.24,
  });
  // inclusionAI: Ring-2.6-1T (free)
  calculator.registerPricing('openrouter/inclusionai/ring-2.6-1t:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Inflection: Inflection 3 Pi
  calculator.registerPricing('openrouter/inflection/inflection-3-pi', {
    inputTokensReadUncachedPPM: 2.5,
    outputTokensGeneratedPPM: 10,
  });
  // Inflection: Inflection 3 Productivity
  calculator.registerPricing('openrouter/inflection/inflection-3-productivity', {
    inputTokensReadUncachedPPM: 2.5,
    outputTokensGeneratedPPM: 10,
  });
  // Kwaipilot: KAT-Coder-Pro V2
  calculator.registerPricing('openrouter/kwaipilot/kat-coder-pro-v2', {
    inputTokensReadUncachedPPM: 0.3,
    inputTokensReadCachedPPM: 0.06,
    outputTokensGeneratedPPM: 1.2,
  });
  // LiquidAI: LFM2-24B-A2B
  calculator.registerPricing('openrouter/liquid/lfm-2-24b-a2b', {
    inputTokensReadUncachedPPM: 0.03,
    outputTokensGeneratedPPM: 0.12,
  });
  // LiquidAI: LFM2.5-1.2B-Instruct (free)
  calculator.registerPricing('openrouter/liquid/lfm-2.5-1.2b-instruct:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // LiquidAI: LFM2.5-1.2B-Thinking (free)
  calculator.registerPricing('openrouter/liquid/lfm-2.5-1.2b-thinking:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Mancer: Weaver (alpha)
  calculator.registerPricing('openrouter/mancer/weaver', {
    inputTokensReadUncachedPPM: 0.75,
    outputTokensGeneratedPPM: 1,
  });
  // Meta: Llama 3 70B Instruct
  calculator.registerPricing('openrouter/meta-llama/llama-3-70b-instruct', {
    inputTokensReadUncachedPPM: 0.51,
    outputTokensGeneratedPPM: 0.74,
  });
  // Meta: Llama 3 8B Instruct
  calculator.registerPricing('openrouter/meta-llama/llama-3-8b-instruct', {
    inputTokensReadUncachedPPM: 0.04,
    outputTokensGeneratedPPM: 0.04,
  });
  // Meta: Llama 3.1 70B Instruct
  calculator.registerPricing('openrouter/meta-llama/llama-3.1-70b-instruct', {
    inputTokensReadUncachedPPM: 0.4,
    outputTokensGeneratedPPM: 0.4,
  });
  // Meta: Llama 3.1 8B Instruct
  calculator.registerPricing('openrouter/meta-llama/llama-3.1-8b-instruct', {
    inputTokensReadUncachedPPM: 0.02,
    outputTokensGeneratedPPM: 0.05,
  });
  // Meta: Llama 3.2 11B Vision Instruct
  calculator.registerPricing('openrouter/meta-llama/llama-3.2-11b-vision-instruct', {
    inputTokensReadUncachedPPM: 0.245,
    outputTokensGeneratedPPM: 0.245,
  });
  // Meta: Llama 3.2 1B Instruct
  calculator.registerPricing('openrouter/meta-llama/llama-3.2-1b-instruct', {
    inputTokensReadUncachedPPM: 0.027,
    outputTokensGeneratedPPM: 0.2,
  });
  // Meta: Llama 3.2 3B Instruct
  calculator.registerPricing('openrouter/meta-llama/llama-3.2-3b-instruct', {
    inputTokensReadUncachedPPM: 0.051,
    outputTokensGeneratedPPM: 0.34,
  });
  // Meta: Llama 3.2 3B Instruct (free)
  calculator.registerPricing('openrouter/meta-llama/llama-3.2-3b-instruct:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Meta: Llama 3.3 70B Instruct
  calculator.registerPricing('openrouter/meta-llama/llama-3.3-70b-instruct', {
    inputTokensReadUncachedPPM: 0.1,
    outputTokensGeneratedPPM: 0.32,
  });
  // Meta: Llama 3.3 70B Instruct (free)
  calculator.registerPricing('openrouter/meta-llama/llama-3.3-70b-instruct:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Meta: Llama 4 Maverick
  calculator.registerPricing('openrouter/meta-llama/llama-4-maverick', {
    inputTokensReadUncachedPPM: 0.15,
    outputTokensGeneratedPPM: 0.6,
  });
  // Meta: Llama 4 Scout
  calculator.registerPricing('openrouter/meta-llama/llama-4-scout', {
    inputTokensReadUncachedPPM: 0.08,
    outputTokensGeneratedPPM: 0.3,
  });
  // Llama Guard 3 8B
  calculator.registerPricing('openrouter/meta-llama/llama-guard-3-8b', {
    inputTokensReadUncachedPPM: 0.48,
    outputTokensGeneratedPPM: 0.03,
  });
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
  // MiniMax: MiniMax M2.1
  calculator.registerPricing('openrouter/minimax/minimax-m2.1', {
    inputTokensReadUncachedPPM: 0.29,
    inputTokensReadCachedPPM: 0.03,
    outputTokensGeneratedPPM: 0.95,
  });
  // MiniMax: MiniMax M2.5
  calculator.registerPricing('openrouter/minimax/minimax-m2.5', {
    inputTokensReadUncachedPPM: 0.15,
    outputTokensGeneratedPPM: 1.15,
  });
  // MiniMax: MiniMax M2.5 (free)
  calculator.registerPricing('openrouter/minimax/minimax-m2.5:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // MiniMax: MiniMax M2.7
  calculator.registerPricing('openrouter/minimax/minimax-m2.7', {
    inputTokensReadUncachedPPM: 0.299,
    outputTokensGeneratedPPM: 1.2,
  });
  // Mistral: Codestral 2508
  calculator.registerPricing('openrouter/mistralai/codestral-2508', {
    inputTokensReadUncachedPPM: 0.3,
    inputTokensReadCachedPPM: 0.03,
    outputTokensGeneratedPPM: 0.9,
  });
  // Mistral: Devstral 2 2512
  calculator.registerPricing('openrouter/mistralai/devstral-2512', {
    inputTokensReadUncachedPPM: 0.4,
    inputTokensReadCachedPPM: 0.04,
    outputTokensGeneratedPPM: 2,
  });
  // Mistral: Devstral Medium
  calculator.registerPricing('openrouter/mistralai/devstral-medium', {
    inputTokensReadUncachedPPM: 0.4,
    inputTokensReadCachedPPM: 0.04,
    outputTokensGeneratedPPM: 2,
  });
  // Mistral: Devstral Small 1.1
  calculator.registerPricing('openrouter/mistralai/devstral-small', {
    inputTokensReadUncachedPPM: 0.1,
    inputTokensReadCachedPPM: 0.01,
    outputTokensGeneratedPPM: 0.3,
  });
  // Mistral: Ministral 3 14B 2512
  calculator.registerPricing('openrouter/mistralai/ministral-14b-2512', {
    inputTokensReadUncachedPPM: 0.2,
    inputTokensReadCachedPPM: 0.02,
    outputTokensGeneratedPPM: 0.2,
  });
  // Mistral: Ministral 3 3B 2512
  calculator.registerPricing('openrouter/mistralai/ministral-3b-2512', {
    inputTokensReadUncachedPPM: 0.1,
    inputTokensReadCachedPPM: 0.01,
    outputTokensGeneratedPPM: 0.1,
  });
  // Mistral: Ministral 3 8B 2512
  calculator.registerPricing('openrouter/mistralai/ministral-8b-2512', {
    inputTokensReadUncachedPPM: 0.15,
    inputTokensReadCachedPPM: 0.015,
    outputTokensGeneratedPPM: 0.15,
  });
  // Mistral: Mistral 7B Instruct v0.1
  calculator.registerPricing('openrouter/mistralai/mistral-7b-instruct-v0.1', {
    inputTokensReadUncachedPPM: 0.11,
    outputTokensGeneratedPPM: 0.19,
  });
  // Mistral Large
  calculator.registerPricing('openrouter/mistralai/mistral-large', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.2,
    outputTokensGeneratedPPM: 6,
  });
  // Mistral Large 2407
  calculator.registerPricing('openrouter/mistralai/mistral-large-2407', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.2,
    outputTokensGeneratedPPM: 6,
  });
  // Mistral Large 2411
  calculator.registerPricing('openrouter/mistralai/mistral-large-2411', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.2,
    outputTokensGeneratedPPM: 6,
  });
  // Mistral: Mistral Large 3 2512
  calculator.registerPricing('openrouter/mistralai/mistral-large-2512', {
    inputTokensReadUncachedPPM: 0.5,
    inputTokensReadCachedPPM: 0.05,
    outputTokensGeneratedPPM: 1.5,
  });
  // Mistral: Mistral Medium 3
  calculator.registerPricing('openrouter/mistralai/mistral-medium-3', {
    inputTokensReadUncachedPPM: 0.4,
    inputTokensReadCachedPPM: 0.04,
    outputTokensGeneratedPPM: 2,
  });
  // Mistral: Mistral Medium 3.5
  calculator.registerPricing('openrouter/mistralai/mistral-medium-3-5', {
    inputTokensReadUncachedPPM: 1.5,
    outputTokensGeneratedPPM: 7.5,
  });
  // Mistral: Mistral Medium 3.1
  calculator.registerPricing('openrouter/mistralai/mistral-medium-3.1', {
    inputTokensReadUncachedPPM: 0.4,
    inputTokensReadCachedPPM: 0.04,
    outputTokensGeneratedPPM: 2,
  });
  // Mistral: Mistral Nemo
  calculator.registerPricing('openrouter/mistralai/mistral-nemo', {
    inputTokensReadUncachedPPM: 0.02,
    outputTokensGeneratedPPM: 0.03,
  });
  // Mistral: Saba
  calculator.registerPricing('openrouter/mistralai/mistral-saba', {
    inputTokensReadUncachedPPM: 0.2,
    inputTokensReadCachedPPM: 0.02,
    outputTokensGeneratedPPM: 0.6,
  });
  // Mistral: Mistral Small 3
  calculator.registerPricing('openrouter/mistralai/mistral-small-24b-instruct-2501', {
    inputTokensReadUncachedPPM: 0.05,
    outputTokensGeneratedPPM: 0.08,
  });
  // Mistral: Mistral Small 4
  calculator.registerPricing('openrouter/mistralai/mistral-small-2603', {
    inputTokensReadUncachedPPM: 0.15,
    inputTokensReadCachedPPM: 0.015,
    outputTokensGeneratedPPM: 0.6,
  });
  // Mistral: Mistral Small 3.1 24B
  calculator.registerPricing('openrouter/mistralai/mistral-small-3.1-24b-instruct', {
    inputTokensReadUncachedPPM: 0.35,
    outputTokensGeneratedPPM: 0.56,
  });
  // Mistral: Mistral Small 3.2 24B
  calculator.registerPricing('openrouter/mistralai/mistral-small-3.2-24b-instruct', {
    inputTokensReadUncachedPPM: 0.075,
    outputTokensGeneratedPPM: 0.2,
  });
  // Mistral: Mixtral 8x22B Instruct
  calculator.registerPricing('openrouter/mistralai/mixtral-8x22b-instruct', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.2,
    outputTokensGeneratedPPM: 6,
  });
  // Mistral: Pixtral Large 2411
  calculator.registerPricing('openrouter/mistralai/pixtral-large-2411', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.2,
    outputTokensGeneratedPPM: 6,
  });
  // Mistral: Voxtral Small 24B 2507
  calculator.registerPricing('openrouter/mistralai/voxtral-small-24b-2507', {
    inputTokensReadUncachedPPM: 0.1,
    inputTokensReadCachedPPM: 0.01,
    outputTokensGeneratedPPM: 0.3,
  });
  // MoonshotAI: Kimi K2 0711
  calculator.registerPricing('openrouter/moonshotai/kimi-k2', {
    inputTokensReadUncachedPPM: 0.57,
    outputTokensGeneratedPPM: 2.3,
  });
  // MoonshotAI: Kimi K2 0905
  calculator.registerPricing('openrouter/moonshotai/kimi-k2-0905', {
    inputTokensReadUncachedPPM: 0.4,
    outputTokensGeneratedPPM: 2,
  });
  // MoonshotAI: Kimi K2 Thinking
  calculator.registerPricing('openrouter/moonshotai/kimi-k2-thinking', {
    inputTokensReadUncachedPPM: 0.6,
    inputTokensReadCachedPPM: 0.15,
    outputTokensGeneratedPPM: 2.5,
  });
  // MoonshotAI: Kimi K2.5
  calculator.registerPricing('openrouter/moonshotai/kimi-k2.5', {
    inputTokensReadUncachedPPM: 0.4,
    inputTokensReadCachedPPM: 0.05,
    outputTokensGeneratedPPM: 1.98,
  });
  // MoonshotAI: Kimi K2.6
  calculator.registerPricing('openrouter/moonshotai/kimi-k2.6', {
    inputTokensReadUncachedPPM: 0.75,
    inputTokensReadCachedPPM: 0.15,
    outputTokensGeneratedPPM: 3.5,
  });
  // Morph: Morph V3 Fast
  calculator.registerPricing('openrouter/morph/morph-v3-fast', {
    inputTokensReadUncachedPPM: 0.8,
    outputTokensGeneratedPPM: 1.2,
  });
  // Morph: Morph V3 Large
  calculator.registerPricing('openrouter/morph/morph-v3-large', {
    inputTokensReadUncachedPPM: 0.9,
    outputTokensGeneratedPPM: 1.9,
  });
  // Nex AGI: DeepSeek V3.1 Nex N1
  calculator.registerPricing('openrouter/nex-agi/deepseek-v3.1-nex-n1', {
    inputTokensReadUncachedPPM: 0.135,
    outputTokensGeneratedPPM: 0.5,
  });
  // NousResearch: Hermes 2 Pro - Llama-3 8B
  calculator.registerPricing('openrouter/nousresearch/hermes-2-pro-llama-3-8b', {
    inputTokensReadUncachedPPM: 0.14,
    outputTokensGeneratedPPM: 0.14,
  });
  // Nous: Hermes 3 405B Instruct
  calculator.registerPricing('openrouter/nousresearch/hermes-3-llama-3.1-405b', {
    inputTokensReadUncachedPPM: 1,
    outputTokensGeneratedPPM: 1,
  });
  // Nous: Hermes 3 405B Instruct (free)
  calculator.registerPricing('openrouter/nousresearch/hermes-3-llama-3.1-405b:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Nous: Hermes 3 70B Instruct
  calculator.registerPricing('openrouter/nousresearch/hermes-3-llama-3.1-70b', {
    inputTokensReadUncachedPPM: 0.3,
    outputTokensGeneratedPPM: 0.3,
  });
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
  // OpenAI: GPT-4 (older v0314)
  calculator.registerPricing('openrouter/openai/gpt-4-0314', {
    inputTokensReadUncachedPPM: 30,
    outputTokensGeneratedPPM: 60,
  });
  // OpenAI: GPT-4 Turbo (older v1106)
  calculator.registerPricing('openrouter/openai/gpt-4-1106-preview', {
    inputTokensReadUncachedPPM: 10,
    outputTokensGeneratedPPM: 30,
  });
  // OpenAI: GPT-4 Turbo
  calculator.registerPricing('openrouter/openai/gpt-4-turbo', {
    inputTokensReadUncachedPPM: 10,
    outputTokensGeneratedPPM: 30,
  });
  // OpenAI: GPT-4 Turbo Preview
  calculator.registerPricing('openrouter/openai/gpt-4-turbo-preview', {
    inputTokensReadUncachedPPM: 10,
    outputTokensGeneratedPPM: 30,
  });
  // OpenAI: GPT-4.1
  calculator.registerPricing('openrouter/openai/gpt-4.1', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.5,
    outputTokensGeneratedPPM: 8,
  });
  // OpenAI: GPT-4.1 Mini
  calculator.registerPricing('openrouter/openai/gpt-4.1-mini', {
    inputTokensReadUncachedPPM: 0.4,
    inputTokensReadCachedPPM: 0.1,
    outputTokensGeneratedPPM: 1.6,
  });
  // OpenAI: GPT-4.1 Nano
  calculator.registerPricing('openrouter/openai/gpt-4.1-nano', {
    inputTokensReadUncachedPPM: 0.1,
    inputTokensReadCachedPPM: 0.025,
    outputTokensGeneratedPPM: 0.4,
  });
  // OpenAI: GPT-4o
  calculator.registerPricing('openrouter/openai/gpt-4o', {
    inputTokensReadUncachedPPM: 2.5,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-4o (2024-05-13)
  calculator.registerPricing('openrouter/openai/gpt-4o-2024-05-13', {
    inputTokensReadUncachedPPM: 5,
    outputTokensGeneratedPPM: 15,
  });
  // OpenAI: GPT-4o (2024-08-06)
  calculator.registerPricing('openrouter/openai/gpt-4o-2024-08-06', {
    inputTokensReadUncachedPPM: 2.5,
    inputTokensReadCachedPPM: 1.25,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-4o (2024-11-20)
  calculator.registerPricing('openrouter/openai/gpt-4o-2024-11-20', {
    inputTokensReadUncachedPPM: 2.5,
    inputTokensReadCachedPPM: 1.25,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-4o Audio
  calculator.registerPricing('openrouter/openai/gpt-4o-audio-preview', {
    inputTokensReadUncachedPPM: 2.5,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-4o-mini
  calculator.registerPricing('openrouter/openai/gpt-4o-mini', {
    inputTokensReadUncachedPPM: 0.15,
    inputTokensReadCachedPPM: 0.075,
    outputTokensGeneratedPPM: 0.6,
  });
  // OpenAI: GPT-4o-mini (2024-07-18)
  calculator.registerPricing('openrouter/openai/gpt-4o-mini-2024-07-18', {
    inputTokensReadUncachedPPM: 0.15,
    inputTokensReadCachedPPM: 0.075,
    outputTokensGeneratedPPM: 0.6,
  });
  // OpenAI: GPT-4o-mini Search Preview
  calculator.registerPricing('openrouter/openai/gpt-4o-mini-search-preview', {
    inputTokensReadUncachedPPM: 0.15,
    outputTokensGeneratedPPM: 0.6,
  });
  // OpenAI: GPT-4o Search Preview
  calculator.registerPricing('openrouter/openai/gpt-4o-search-preview', {
    inputTokensReadUncachedPPM: 2.5,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-5
  calculator.registerPricing('openrouter/openai/gpt-5', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-5 Chat
  calculator.registerPricing('openrouter/openai/gpt-5-chat', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-5 Codex
  calculator.registerPricing('openrouter/openai/gpt-5-codex', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-5 Image
  calculator.registerPricing('openrouter/openai/gpt-5-image', {
    inputTokensReadUncachedPPM: 10,
    inputTokensReadCachedPPM: 1.25,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-5 Image Mini
  calculator.registerPricing('openrouter/openai/gpt-5-image-mini', {
    inputTokensReadUncachedPPM: 2.5,
    inputTokensReadCachedPPM: 0.25,
    outputTokensGeneratedPPM: 2,
  });
  // OpenAI: GPT-5 Mini
  calculator.registerPricing('openrouter/openai/gpt-5-mini', {
    inputTokensReadUncachedPPM: 0.25,
    inputTokensReadCachedPPM: 0.025,
    outputTokensGeneratedPPM: 2,
  });
  // OpenAI: GPT-5 Nano
  calculator.registerPricing('openrouter/openai/gpt-5-nano', {
    inputTokensReadUncachedPPM: 0.05,
    inputTokensReadCachedPPM: 0.01,
    outputTokensGeneratedPPM: 0.4,
  });
  // OpenAI: GPT-5 Pro
  calculator.registerPricing('openrouter/openai/gpt-5-pro', {
    inputTokensReadUncachedPPM: 15,
    outputTokensGeneratedPPM: 120,
  });
  // OpenAI: GPT-5.1
  calculator.registerPricing('openrouter/openai/gpt-5.1', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.13,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-5.1 Chat
  calculator.registerPricing('openrouter/openai/gpt-5.1-chat', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-5.1-Codex
  calculator.registerPricing('openrouter/openai/gpt-5.1-codex', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-5.1-Codex-Max
  calculator.registerPricing('openrouter/openai/gpt-5.1-codex-max', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.125,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT-5.1-Codex-Mini
  calculator.registerPricing('openrouter/openai/gpt-5.1-codex-mini', {
    inputTokensReadUncachedPPM: 0.25,
    inputTokensReadCachedPPM: 0.03,
    outputTokensGeneratedPPM: 2,
  });
  // OpenAI: GPT-5.2
  calculator.registerPricing('openrouter/openai/gpt-5.2', {
    inputTokensReadUncachedPPM: 1.75,
    inputTokensReadCachedPPM: 0.175,
    outputTokensGeneratedPPM: 14,
  });
  // OpenAI: GPT-5.2 Chat
  calculator.registerPricing('openrouter/openai/gpt-5.2-chat', {
    inputTokensReadUncachedPPM: 1.75,
    inputTokensReadCachedPPM: 0.175,
    outputTokensGeneratedPPM: 14,
  });
  // OpenAI: GPT-5.2-Codex
  calculator.registerPricing('openrouter/openai/gpt-5.2-codex', {
    inputTokensReadUncachedPPM: 1.75,
    inputTokensReadCachedPPM: 0.175,
    outputTokensGeneratedPPM: 14,
  });
  // OpenAI: GPT-5.2 Pro
  calculator.registerPricing('openrouter/openai/gpt-5.2-pro', {
    inputTokensReadUncachedPPM: 21,
    outputTokensGeneratedPPM: 168,
  });
  // OpenAI: GPT-5.3 Chat
  calculator.registerPricing('openrouter/openai/gpt-5.3-chat', {
    inputTokensReadUncachedPPM: 1.75,
    inputTokensReadCachedPPM: 0.175,
    outputTokensGeneratedPPM: 14,
  });
  // OpenAI: GPT-5.3-Codex
  calculator.registerPricing('openrouter/openai/gpt-5.3-codex', {
    inputTokensReadUncachedPPM: 1.75,
    inputTokensReadCachedPPM: 0.175,
    outputTokensGeneratedPPM: 14,
  });
  // OpenAI: GPT-5.4
  calculator.registerPricing('openrouter/openai/gpt-5.4', {
    inputTokensReadUncachedPPM: 2.5,
    inputTokensReadCachedPPM: 0.25,
    outputTokensGeneratedPPM: 15,
  });
  // OpenAI: GPT-5.4 Image 2
  calculator.registerPricing('openrouter/openai/gpt-5.4-image-2', {
    inputTokensReadUncachedPPM: 8,
    inputTokensReadCachedPPM: 2,
    outputTokensGeneratedPPM: 15,
  });
  // OpenAI: GPT-5.4 Mini
  calculator.registerPricing('openrouter/openai/gpt-5.4-mini', {
    inputTokensReadUncachedPPM: 0.75,
    inputTokensReadCachedPPM: 0.075,
    outputTokensGeneratedPPM: 4.5,
  });
  // OpenAI: GPT-5.4 Nano
  calculator.registerPricing('openrouter/openai/gpt-5.4-nano', {
    inputTokensReadUncachedPPM: 0.2,
    inputTokensReadCachedPPM: 0.02,
    outputTokensGeneratedPPM: 1.25,
  });
  // OpenAI: GPT-5.4 Pro
  calculator.registerPricing('openrouter/openai/gpt-5.4-pro', {
    inputTokensReadUncachedPPM: 30,
    outputTokensGeneratedPPM: 180,
  });
  // OpenAI: GPT-5.5
  calculator.registerPricing('openrouter/openai/gpt-5.5', {
    inputTokensReadUncachedPPM: 5,
    inputTokensReadCachedPPM: 0.5,
    outputTokensGeneratedPPM: 30,
  });
  // OpenAI: GPT-5.5 Pro
  calculator.registerPricing('openrouter/openai/gpt-5.5-pro', {
    inputTokensReadUncachedPPM: 30,
    outputTokensGeneratedPPM: 180,
  });
  // OpenAI: GPT Audio
  calculator.registerPricing('openrouter/openai/gpt-audio', {
    inputTokensReadUncachedPPM: 2.5,
    outputTokensGeneratedPPM: 10,
  });
  // OpenAI: GPT Audio Mini
  calculator.registerPricing('openrouter/openai/gpt-audio-mini', {
    inputTokensReadUncachedPPM: 0.6,
    outputTokensGeneratedPPM: 2.4,
  });
  // OpenAI: GPT Chat Latest
  calculator.registerPricing('openrouter/openai/gpt-chat-latest', {
    inputTokensReadUncachedPPM: 5,
    inputTokensReadCachedPPM: 0.5,
    outputTokensGeneratedPPM: 30,
  });
  // OpenAI: gpt-oss-120b
  calculator.registerPricing('openrouter/openai/gpt-oss-120b', {
    inputTokensReadUncachedPPM: 0.039,
    outputTokensGeneratedPPM: 0.18,
  });
  // OpenAI: gpt-oss-120b (free)
  calculator.registerPricing('openrouter/openai/gpt-oss-120b:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // OpenAI: gpt-oss-20b
  calculator.registerPricing('openrouter/openai/gpt-oss-20b', {
    inputTokensReadUncachedPPM: 0.03,
    outputTokensGeneratedPPM: 0.14,
  });
  // OpenAI: gpt-oss-20b (free)
  calculator.registerPricing('openrouter/openai/gpt-oss-20b:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // OpenAI: gpt-oss-safeguard-20b
  calculator.registerPricing('openrouter/openai/gpt-oss-safeguard-20b', {
    inputTokensReadUncachedPPM: 0.075,
    inputTokensReadCachedPPM: 0.037,
    outputTokensGeneratedPPM: 0.3,
  });
  // OpenAI: o1
  calculator.registerPricing('openrouter/openai/o1', {
    inputTokensReadUncachedPPM: 15,
    inputTokensReadCachedPPM: 7.5,
    outputTokensGeneratedPPM: 60,
  });
  // OpenAI: o1-pro
  calculator.registerPricing('openrouter/openai/o1-pro', {
    inputTokensReadUncachedPPM: 150,
    outputTokensGeneratedPPM: 600,
  });
  // OpenAI: o3
  calculator.registerPricing('openrouter/openai/o3', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.5,
    outputTokensGeneratedPPM: 8,
  });
  // OpenAI: o3 Deep Research
  calculator.registerPricing('openrouter/openai/o3-deep-research', {
    inputTokensReadUncachedPPM: 10,
    inputTokensReadCachedPPM: 2.5,
    outputTokensGeneratedPPM: 40,
  });
  // OpenAI: o3 Mini
  calculator.registerPricing('openrouter/openai/o3-mini', {
    inputTokensReadUncachedPPM: 1.1,
    inputTokensReadCachedPPM: 0.55,
    outputTokensGeneratedPPM: 4.4,
  });
  // OpenAI: o3 Mini High
  calculator.registerPricing('openrouter/openai/o3-mini-high', {
    inputTokensReadUncachedPPM: 1.1,
    inputTokensReadCachedPPM: 0.55,
    outputTokensGeneratedPPM: 4.4,
  });
  // OpenAI: o3 Pro
  calculator.registerPricing('openrouter/openai/o3-pro', {
    inputTokensReadUncachedPPM: 20,
    outputTokensGeneratedPPM: 80,
  });
  // OpenAI: o4 Mini
  calculator.registerPricing('openrouter/openai/o4-mini', {
    inputTokensReadUncachedPPM: 1.1,
    inputTokensReadCachedPPM: 0.275,
    outputTokensGeneratedPPM: 4.4,
  });
  // OpenAI: o4 Mini Deep Research
  calculator.registerPricing('openrouter/openai/o4-mini-deep-research', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.5,
    outputTokensGeneratedPPM: 8,
  });
  // OpenAI: o4 Mini High
  calculator.registerPricing('openrouter/openai/o4-mini-high', {
    inputTokensReadUncachedPPM: 1.1,
    inputTokensReadCachedPPM: 0.275,
    outputTokensGeneratedPPM: 4.4,
  });
  // Auto Router
  calculator.registerPricing('openrouter/openrouter/auto', {
    inputTokensReadUncachedPPM: -1000000,
    outputTokensGeneratedPPM: -1000000,
  });
  // Body Builder (beta)
  calculator.registerPricing('openrouter/openrouter/bodybuilder', {
    inputTokensReadUncachedPPM: -1000000,
    outputTokensGeneratedPPM: -1000000,
  });
  // Free Models Router
  calculator.registerPricing('openrouter/openrouter/free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Owl Alpha
  calculator.registerPricing('openrouter/openrouter/owl-alpha', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
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
  // Prime Intellect: INTELLECT-3
  calculator.registerPricing('openrouter/prime-intellect/intellect-3', {
    inputTokensReadUncachedPPM: 0.2,
    outputTokensGeneratedPPM: 1.1,
  });
  // Qwen2.5 72B Instruct
  calculator.registerPricing('openrouter/qwen/qwen-2.5-72b-instruct', {
    inputTokensReadUncachedPPM: 0.36,
    outputTokensGeneratedPPM: 0.4,
  });
  // Qwen: Qwen2.5 7B Instruct
  calculator.registerPricing('openrouter/qwen/qwen-2.5-7b-instruct', {
    inputTokensReadUncachedPPM: 0.04,
    outputTokensGeneratedPPM: 0.1,
  });
  // Qwen2.5 Coder 32B Instruct
  calculator.registerPricing('openrouter/qwen/qwen-2.5-coder-32b-instruct', {
    inputTokensReadUncachedPPM: 0.66,
    outputTokensGeneratedPPM: 1,
  });
  // Qwen: Qwen-Max
  calculator.registerPricing('openrouter/qwen/qwen-max', {
    inputTokensReadUncachedPPM: 1.04,
    inputTokensReadCachedPPM: 0.208,
    outputTokensGeneratedPPM: 4.16,
  });
  // Qwen: Qwen-Plus
  calculator.registerPricing('openrouter/qwen/qwen-plus', {
    inputTokensReadUncachedPPM: 0.26,
    inputTokensReadCachedPPM: 0.052,
    inputTokensWriteCachedPPM: 0.325,
    outputTokensGeneratedPPM: 0.78,
  });
  // Qwen: Qwen Plus 0728
  calculator.registerPricing('openrouter/qwen/qwen-plus-2025-07-28', {
    inputTokensReadUncachedPPM: 0.26,
    inputTokensWriteCachedPPM: 0.325,
    outputTokensGeneratedPPM: 0.78,
  });
  // Qwen: Qwen Plus 0728 (thinking)
  calculator.registerPricing('openrouter/qwen/qwen-plus-2025-07-28:thinking', {
    inputTokensReadUncachedPPM: 0.26,
    inputTokensWriteCachedPPM: 0.325,
    outputTokensGeneratedPPM: 0.78,
  });
  // Qwen: Qwen-Turbo
  calculator.registerPricing('openrouter/qwen/qwen-turbo', {
    inputTokensReadUncachedPPM: 0.0325,
    inputTokensReadCachedPPM: 0.0065,
    outputTokensGeneratedPPM: 0.13,
  });
  // Qwen: Qwen VL Max
  calculator.registerPricing('openrouter/qwen/qwen-vl-max', {
    inputTokensReadUncachedPPM: 0.52,
    outputTokensGeneratedPPM: 2.08,
  });
  // Qwen: Qwen VL Plus
  calculator.registerPricing('openrouter/qwen/qwen-vl-plus', {
    inputTokensReadUncachedPPM: 0.1365,
    inputTokensReadCachedPPM: 0.0273,
    outputTokensGeneratedPPM: 0.4095,
  });
  // Qwen: Qwen2.5 VL 72B Instruct
  calculator.registerPricing('openrouter/qwen/qwen2.5-vl-72b-instruct', {
    inputTokensReadUncachedPPM: 0.25,
    outputTokensGeneratedPPM: 0.75,
  });
  // Qwen: Qwen3 14B
  calculator.registerPricing('openrouter/qwen/qwen3-14b', {
    inputTokensReadUncachedPPM: 0.06,
    outputTokensGeneratedPPM: 0.24,
  });
  // Qwen: Qwen3 235B A22B
  calculator.registerPricing('openrouter/qwen/qwen3-235b-a22b', {
    inputTokensReadUncachedPPM: 0.455,
    outputTokensGeneratedPPM: 1.82,
  });
  // Qwen: Qwen3 235B A22B Instruct 2507
  calculator.registerPricing('openrouter/qwen/qwen3-235b-a22b-2507', {
    inputTokensReadUncachedPPM: 0.071,
    outputTokensGeneratedPPM: 0.1,
  });
  // Qwen: Qwen3 235B A22B Thinking 2507
  calculator.registerPricing('openrouter/qwen/qwen3-235b-a22b-thinking-2507', {
    inputTokensReadUncachedPPM: 0.1495,
    outputTokensGeneratedPPM: 1.495,
  });
  // Qwen: Qwen3 30B A3B
  calculator.registerPricing('openrouter/qwen/qwen3-30b-a3b', {
    inputTokensReadUncachedPPM: 0.09,
    outputTokensGeneratedPPM: 0.45,
  });
  // Qwen: Qwen3 30B A3B Instruct 2507
  calculator.registerPricing('openrouter/qwen/qwen3-30b-a3b-instruct-2507', {
    inputTokensReadUncachedPPM: 0.09,
    outputTokensGeneratedPPM: 0.3,
  });
  // Qwen: Qwen3 30B A3B Thinking 2507
  calculator.registerPricing('openrouter/qwen/qwen3-30b-a3b-thinking-2507', {
    inputTokensReadUncachedPPM: 0.08,
    inputTokensReadCachedPPM: 0.08,
    outputTokensGeneratedPPM: 0.4,
  });
  // Qwen: Qwen3 32B
  calculator.registerPricing('openrouter/qwen/qwen3-32b', {
    inputTokensReadUncachedPPM: 0.08,
    outputTokensGeneratedPPM: 0.28,
  });
  // Qwen: Qwen3 8B
  calculator.registerPricing('openrouter/qwen/qwen3-8b', {
    inputTokensReadUncachedPPM: 0.05,
    inputTokensReadCachedPPM: 0.05,
    outputTokensGeneratedPPM: 0.4,
  });
  // Qwen: Qwen3 Coder 480B A35B
  calculator.registerPricing('openrouter/qwen/qwen3-coder', {
    inputTokensReadUncachedPPM: 0.22,
    outputTokensGeneratedPPM: 1.8,
  });
  // Qwen: Qwen3 Coder 30B A3B Instruct
  calculator.registerPricing('openrouter/qwen/qwen3-coder-30b-a3b-instruct', {
    inputTokensReadUncachedPPM: 0.07,
    outputTokensGeneratedPPM: 0.27,
  });
  // Qwen: Qwen3 Coder Flash
  calculator.registerPricing('openrouter/qwen/qwen3-coder-flash', {
    inputTokensReadUncachedPPM: 0.195,
    inputTokensReadCachedPPM: 0.039,
    inputTokensWriteCachedPPM: 0.24375,
    outputTokensGeneratedPPM: 0.975,
  });
  // Qwen: Qwen3 Coder Next
  calculator.registerPricing('openrouter/qwen/qwen3-coder-next', {
    inputTokensReadUncachedPPM: 0.11,
    inputTokensReadCachedPPM: 0.07,
    outputTokensGeneratedPPM: 0.8,
  });
  // Qwen: Qwen3 Coder Plus
  calculator.registerPricing('openrouter/qwen/qwen3-coder-plus', {
    inputTokensReadUncachedPPM: 0.65,
    inputTokensReadCachedPPM: 0.13,
    inputTokensWriteCachedPPM: 0.8125,
    outputTokensGeneratedPPM: 3.25,
  });
  // Qwen: Qwen3 Coder 480B A35B (free)
  calculator.registerPricing('openrouter/qwen/qwen3-coder:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Qwen: Qwen3 Max
  calculator.registerPricing('openrouter/qwen/qwen3-max', {
    inputTokensReadUncachedPPM: 0.78,
    inputTokensReadCachedPPM: 0.156,
    inputTokensWriteCachedPPM: 0.975,
    outputTokensGeneratedPPM: 3.9,
  });
  // Qwen: Qwen3 Max Thinking
  calculator.registerPricing('openrouter/qwen/qwen3-max-thinking', {
    inputTokensReadUncachedPPM: 0.78,
    outputTokensGeneratedPPM: 3.9,
  });
  // Qwen: Qwen3 Next 80B A3B Instruct
  calculator.registerPricing('openrouter/qwen/qwen3-next-80b-a3b-instruct', {
    inputTokensReadUncachedPPM: 0.09,
    outputTokensGeneratedPPM: 1.1,
  });
  // Qwen: Qwen3 Next 80B A3B Instruct (free)
  calculator.registerPricing('openrouter/qwen/qwen3-next-80b-a3b-instruct:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Qwen: Qwen3 Next 80B A3B Thinking
  calculator.registerPricing('openrouter/qwen/qwen3-next-80b-a3b-thinking', {
    inputTokensReadUncachedPPM: 0.0975,
    outputTokensGeneratedPPM: 0.78,
  });
  // Qwen: Qwen3 VL 235B A22B Instruct
  calculator.registerPricing('openrouter/qwen/qwen3-vl-235b-a22b-instruct', {
    inputTokensReadUncachedPPM: 0.2,
    inputTokensReadCachedPPM: 0.11,
    outputTokensGeneratedPPM: 0.88,
  });
  // Qwen: Qwen3 VL 235B A22B Thinking
  calculator.registerPricing('openrouter/qwen/qwen3-vl-235b-a22b-thinking', {
    inputTokensReadUncachedPPM: 0.26,
    outputTokensGeneratedPPM: 2.6,
  });
  // Qwen: Qwen3 VL 30B A3B Instruct
  calculator.registerPricing('openrouter/qwen/qwen3-vl-30b-a3b-instruct', {
    inputTokensReadUncachedPPM: 0.13,
    outputTokensGeneratedPPM: 0.52,
  });
  // Qwen: Qwen3 VL 30B A3B Thinking
  calculator.registerPricing('openrouter/qwen/qwen3-vl-30b-a3b-thinking', {
    inputTokensReadUncachedPPM: 0.13,
    outputTokensGeneratedPPM: 1.56,
  });
  // Qwen: Qwen3 VL 32B Instruct
  calculator.registerPricing('openrouter/qwen/qwen3-vl-32b-instruct', {
    inputTokensReadUncachedPPM: 0.104,
    outputTokensGeneratedPPM: 0.416,
  });
  // Qwen: Qwen3 VL 8B Instruct
  calculator.registerPricing('openrouter/qwen/qwen3-vl-8b-instruct', {
    inputTokensReadUncachedPPM: 0.08,
    outputTokensGeneratedPPM: 0.5,
  });
  // Qwen: Qwen3 VL 8B Thinking
  calculator.registerPricing('openrouter/qwen/qwen3-vl-8b-thinking', {
    inputTokensReadUncachedPPM: 0.117,
    outputTokensGeneratedPPM: 1.365,
  });
  // Qwen: Qwen3.5-122B-A10B
  calculator.registerPricing('openrouter/qwen/qwen3.5-122b-a10b', {
    inputTokensReadUncachedPPM: 0.26,
    outputTokensGeneratedPPM: 2.08,
  });
  // Qwen: Qwen3.5-27B
  calculator.registerPricing('openrouter/qwen/qwen3.5-27b', {
    inputTokensReadUncachedPPM: 0.195,
    outputTokensGeneratedPPM: 1.56,
  });
  // Qwen: Qwen3.5-35B-A3B
  calculator.registerPricing('openrouter/qwen/qwen3.5-35b-a3b', {
    inputTokensReadUncachedPPM: 0.14,
    inputTokensReadCachedPPM: 0.05,
    outputTokensGeneratedPPM: 1,
  });
  // Qwen: Qwen3.5 397B A17B
  calculator.registerPricing('openrouter/qwen/qwen3.5-397b-a17b', {
    inputTokensReadUncachedPPM: 0.39,
    inputTokensReadCachedPPM: 0.195,
    outputTokensGeneratedPPM: 2.34,
  });
  // Qwen: Qwen3.5-9B
  calculator.registerPricing('openrouter/qwen/qwen3.5-9b', {
    inputTokensReadUncachedPPM: 0.04,
    outputTokensGeneratedPPM: 0.15,
  });
  // Qwen: Qwen3.5-Flash
  calculator.registerPricing('openrouter/qwen/qwen3.5-flash-02-23', {
    inputTokensReadUncachedPPM: 0.065,
    inputTokensWriteCachedPPM: 0.08125,
    outputTokensGeneratedPPM: 0.26,
  });
  // Qwen: Qwen3.5 Plus 2026-02-15
  calculator.registerPricing('openrouter/qwen/qwen3.5-plus-02-15', {
    inputTokensReadUncachedPPM: 0.26,
    inputTokensWriteCachedPPM: 0.325,
    outputTokensGeneratedPPM: 1.56,
  });
  // Qwen: Qwen3.5 Plus 2026-04-20
  calculator.registerPricing('openrouter/qwen/qwen3.5-plus-20260420', {
    inputTokensReadUncachedPPM: 0.4,
    outputTokensGeneratedPPM: 2.4,
  });
  // Qwen: Qwen3.6 27B
  calculator.registerPricing('openrouter/qwen/qwen3.6-27b', {
    inputTokensReadUncachedPPM: 0.32,
    outputTokensGeneratedPPM: 3.2,
  });
  // Qwen: Qwen3.6 35B A3B
  calculator.registerPricing('openrouter/qwen/qwen3.6-35b-a3b', {
    inputTokensReadUncachedPPM: 0.15,
    inputTokensReadCachedPPM: 0.05,
    outputTokensGeneratedPPM: 1,
  });
  // Qwen: Qwen3.6 Flash
  calculator.registerPricing('openrouter/qwen/qwen3.6-flash', {
    inputTokensReadUncachedPPM: 0.25,
    inputTokensWriteCachedPPM: 0.3125,
    outputTokensGeneratedPPM: 1.5,
  });
  // Qwen: Qwen3.6 Max Preview
  calculator.registerPricing('openrouter/qwen/qwen3.6-max-preview', {
    inputTokensReadUncachedPPM: 1.04,
    inputTokensWriteCachedPPM: 1.3,
    outputTokensGeneratedPPM: 6.24,
  });
  // Qwen: Qwen3.6 Plus
  calculator.registerPricing('openrouter/qwen/qwen3.6-plus', {
    inputTokensReadUncachedPPM: 0.325,
    inputTokensWriteCachedPPM: 0.40625,
    outputTokensGeneratedPPM: 1.95,
  });
  // Reka Edge
  calculator.registerPricing('openrouter/rekaai/reka-edge', {
    inputTokensReadUncachedPPM: 0.1,
    outputTokensGeneratedPPM: 0.1,
  });
  // Reka Flash 3
  calculator.registerPricing('openrouter/rekaai/reka-flash-3', {
    inputTokensReadUncachedPPM: 0.1,
    outputTokensGeneratedPPM: 0.2,
  });
  // Relace: Relace Apply 3
  calculator.registerPricing('openrouter/relace/relace-apply-3', {
    inputTokensReadUncachedPPM: 0.85,
    outputTokensGeneratedPPM: 1.25,
  });
  // Relace: Relace Search
  calculator.registerPricing('openrouter/relace/relace-search', {
    inputTokensReadUncachedPPM: 1,
    outputTokensGeneratedPPM: 3,
  });
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
  // xAI: Grok 3
  calculator.registerPricing('openrouter/x-ai/grok-3', {
    inputTokensReadUncachedPPM: 3,
    inputTokensReadCachedPPM: 0.75,
    outputTokensGeneratedPPM: 15,
  });
  // xAI: Grok 3 Beta
  calculator.registerPricing('openrouter/x-ai/grok-3-beta', {
    inputTokensReadUncachedPPM: 3,
    inputTokensReadCachedPPM: 0.75,
    outputTokensGeneratedPPM: 15,
  });
  // xAI: Grok 3 Mini
  calculator.registerPricing('openrouter/x-ai/grok-3-mini', {
    inputTokensReadUncachedPPM: 0.3,
    inputTokensReadCachedPPM: 0.075,
    outputTokensGeneratedPPM: 0.5,
  });
  // xAI: Grok 3 Mini Beta
  calculator.registerPricing('openrouter/x-ai/grok-3-mini-beta', {
    inputTokensReadUncachedPPM: 0.3,
    inputTokensReadCachedPPM: 0.075,
    outputTokensGeneratedPPM: 0.5,
  });
  // xAI: Grok 4
  calculator.registerPricing('openrouter/x-ai/grok-4', {
    inputTokensReadUncachedPPM: 3,
    inputTokensReadCachedPPM: 0.75,
    outputTokensGeneratedPPM: 15,
  });
  // xAI: Grok 4 Fast
  calculator.registerPricing('openrouter/x-ai/grok-4-fast', {
    inputTokensReadUncachedPPM: 0.2,
    inputTokensReadCachedPPM: 0.05,
    outputTokensGeneratedPPM: 0.5,
  });
  // xAI: Grok 4.1 Fast
  calculator.registerPricing('openrouter/x-ai/grok-4.1-fast', {
    inputTokensReadUncachedPPM: 0.2,
    inputTokensReadCachedPPM: 0.05,
    outputTokensGeneratedPPM: 0.5,
  });
  // xAI: Grok 4.20
  calculator.registerPricing('openrouter/x-ai/grok-4.20', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.2,
    outputTokensGeneratedPPM: 2.5,
  });
  // xAI: Grok 4.20 Multi-Agent
  calculator.registerPricing('openrouter/x-ai/grok-4.20-multi-agent', {
    inputTokensReadUncachedPPM: 2,
    inputTokensReadCachedPPM: 0.2,
    outputTokensGeneratedPPM: 6,
  });
  // xAI: Grok 4.3
  calculator.registerPricing('openrouter/x-ai/grok-4.3', {
    inputTokensReadUncachedPPM: 1.25,
    inputTokensReadCachedPPM: 0.2,
    outputTokensGeneratedPPM: 2.5,
  });
  // xAI: Grok Code Fast 1
  calculator.registerPricing('openrouter/x-ai/grok-code-fast-1', {
    inputTokensReadUncachedPPM: 0.2,
    inputTokensReadCachedPPM: 0.02,
    outputTokensGeneratedPPM: 1.5,
  });
  // Xiaomi: MiMo-V2-Flash
  calculator.registerPricing('openrouter/xiaomi/mimo-v2-flash', {
    inputTokensReadUncachedPPM: 0.1,
    inputTokensReadCachedPPM: 0.01,
    outputTokensGeneratedPPM: 0.3,
  });
  // Xiaomi: MiMo-V2-Omni
  calculator.registerPricing('openrouter/xiaomi/mimo-v2-omni', {
    inputTokensReadUncachedPPM: 0.4,
    inputTokensReadCachedPPM: 0.08,
    outputTokensGeneratedPPM: 2,
  });
  // Xiaomi: MiMo-V2-Pro
  calculator.registerPricing('openrouter/xiaomi/mimo-v2-pro', {
    inputTokensReadUncachedPPM: 1,
    inputTokensReadCachedPPM: 0.2,
    outputTokensGeneratedPPM: 3,
  });
  // Xiaomi: MiMo-V2.5
  calculator.registerPricing('openrouter/xiaomi/mimo-v2.5', {
    inputTokensReadUncachedPPM: 0.4,
    inputTokensReadCachedPPM: 0.08,
    outputTokensGeneratedPPM: 2,
  });
  // Xiaomi: MiMo-V2.5-Pro
  calculator.registerPricing('openrouter/xiaomi/mimo-v2.5-pro', {
    inputTokensReadUncachedPPM: 1,
    inputTokensReadCachedPPM: 0.2,
    outputTokensGeneratedPPM: 3,
  });
  // Z.ai: GLM 4 32B
  calculator.registerPricing('openrouter/z-ai/glm-4-32b', {
    inputTokensReadUncachedPPM: 0.1,
    outputTokensGeneratedPPM: 0.1,
  });
  // Z.ai: GLM 4.5
  calculator.registerPricing('openrouter/z-ai/glm-4.5', {
    inputTokensReadUncachedPPM: 0.6,
    inputTokensReadCachedPPM: 0.11,
    outputTokensGeneratedPPM: 2.2,
  });
  // Z.ai: GLM 4.5 Air
  calculator.registerPricing('openrouter/z-ai/glm-4.5-air', {
    inputTokensReadUncachedPPM: 0.13,
    inputTokensReadCachedPPM: 0.025,
    outputTokensGeneratedPPM: 0.85,
  });
  // Z.ai: GLM 4.5 Air (free)
  calculator.registerPricing('openrouter/z-ai/glm-4.5-air:free', {
    inputTokensReadUncachedPPM: 0,
    outputTokensGeneratedPPM: 0,
  });
  // Z.ai: GLM 4.5V
  calculator.registerPricing('openrouter/z-ai/glm-4.5v', {
    inputTokensReadUncachedPPM: 0.6,
    inputTokensReadCachedPPM: 0.11,
    outputTokensGeneratedPPM: 1.8,
  });
  // Z.ai: GLM 4.6
  calculator.registerPricing('openrouter/z-ai/glm-4.6', {
    inputTokensReadUncachedPPM: 0.39,
    outputTokensGeneratedPPM: 1.9,
  });
  // Z.ai: GLM 4.6V
  calculator.registerPricing('openrouter/z-ai/glm-4.6v', {
    inputTokensReadUncachedPPM: 0.3,
    inputTokensReadCachedPPM: 0.05,
    outputTokensGeneratedPPM: 0.9,
  });
  // Z.ai: GLM 4.7
  calculator.registerPricing('openrouter/z-ai/glm-4.7', {
    inputTokensReadUncachedPPM: 0.4,
    inputTokensReadCachedPPM: 0.08,
    outputTokensGeneratedPPM: 1.75,
  });
  // Z.ai: GLM 4.7 Flash
  calculator.registerPricing('openrouter/z-ai/glm-4.7-flash', {
    inputTokensReadUncachedPPM: 0.06,
    inputTokensReadCachedPPM: 0.01,
    outputTokensGeneratedPPM: 0.4,
  });
  // Z.ai: GLM 5
  calculator.registerPricing('openrouter/z-ai/glm-5', {
    inputTokensReadUncachedPPM: 0.6,
    inputTokensReadCachedPPM: 0.12,
    outputTokensGeneratedPPM: 1.92,
  });
  // Z.ai: GLM 5 Turbo
  calculator.registerPricing('openrouter/z-ai/glm-5-turbo', {
    inputTokensReadUncachedPPM: 1.2,
    inputTokensReadCachedPPM: 0.24,
    outputTokensGeneratedPPM: 4,
  });
  // Z.ai: GLM 5.1
  calculator.registerPricing('openrouter/z-ai/glm-5.1', {
    inputTokensReadUncachedPPM: 1.05,
    inputTokensReadCachedPPM: 0.525,
    outputTokensGeneratedPPM: 3.5,
  });
  // Z.ai: GLM 5V Turbo
  calculator.registerPricing('openrouter/z-ai/glm-5v-turbo', {
    inputTokensReadUncachedPPM: 1.2,
    inputTokensReadCachedPPM: 0.24,
    outputTokensGeneratedPPM: 4,
  });
}
