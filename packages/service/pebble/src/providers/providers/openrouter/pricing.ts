import { type ModelUsage, type PricingLineItem, staticPriceCalculator } from '../../../pricing';
import type { OpenRouterChatCompletionResponse, OpenRouterTranscriptionResponse } from './types';

interface OpenRouterPriceLineItemsInput {
  data: OpenRouterChatCompletionResponse;
  modelId: string;
}

export function buildOpenRouterPriceLineItems(input: OpenRouterPriceLineItemsInput): PricingLineItem[] {
  return staticPriceCalculator.lineItemsForUsage('openrouter', input.modelId, readOpenRouterUsage(input.data));
}

interface OpenRouterTranscriptionPriceLineItemsInput {
  data: OpenRouterTranscriptionResponse;
  modelId: string;
}

/**
 * Maps OpenRouter transcription token usage onto Pebble's pricing line items.
 * If only seconds are reported, no token line items are recorded since the
 * static price table is token-based; the cost is still surfaced in providerOutput.
 */
export function buildOpenRouterTranscriptionPriceLineItems(
  input: OpenRouterTranscriptionPriceLineItemsInput,
): PricingLineItem[] {
  return staticPriceCalculator.lineItemsForUsage(
    'openrouter',
    input.modelId,
    readOpenRouterTranscriptionUsage(input.data),
  );
}

interface OpenRouterSpeechPriceLineItemsInput {
  modelId: string;
  characters: number;
}

/**
 * Speech endpoints don't return usage; pricing is per-character.
 * Each character is treated as a single uncached input token for line-item rollup.
 */
export function buildOpenRouterSpeechPriceLineItems(input: OpenRouterSpeechPriceLineItemsInput): PricingLineItem[] {
  if (input.characters === 0) {
    return [];
  }
  return staticPriceCalculator.lineItemsForUsage('openrouter', input.modelId, {
    inputTokensReadUncached: input.characters,
  });
}

function readOpenRouterUsage(data: OpenRouterChatCompletionResponse): ModelUsage | undefined {
  if (data.usage === undefined) {
    return undefined;
  }

  const cachedTokens = data.usage.prompt_tokens_details?.cached_tokens ?? 0;
  const reasoningTokens = data.usage.completion_tokens_details?.reasoning_tokens ?? 0;

  return {
    inputTokensReadCached: cachedTokens,
    inputTokensReadUncached: Math.max(data.usage.prompt_tokens - cachedTokens, 0),
    outputTokensGenerated: Math.max(data.usage.completion_tokens - reasoningTokens, 0),
    outputTokensThinking: reasoningTokens,
  };
}

function readOpenRouterTranscriptionUsage(data: OpenRouterTranscriptionResponse): ModelUsage | undefined {
  const usage = data.usage;
  if (usage === undefined) {
    return undefined;
  }
  const inputTokens = usage.input_tokens ?? 0;
  const outputTokens = usage.output_tokens ?? 0;
  if (inputTokens === 0 && outputTokens === 0) {
    return undefined;
  }
  return {
    inputTokensReadUncached: inputTokens,
    outputTokensGenerated: outputTokens,
  };
}
