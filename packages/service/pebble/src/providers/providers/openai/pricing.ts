import { type ModelUsage, type PricingLineItem, staticPriceCalculator } from '../../../pricing';
import type { OpenAIChatCompletionResponse, OpenAITranscriptionResponse } from './types';

interface OpenAIPriceLineItemsInput {
  data: OpenAIChatCompletionResponse;
  modelId: string;
}

export function buildOpenAIPriceLineItems(input: OpenAIPriceLineItemsInput): PricingLineItem[] {
  return staticPriceCalculator.lineItemsForUsage('openai', input.modelId, readOpenAIUsage(input.data));
}

interface OpenAITranscriptionPriceLineItemsInput {
  data: OpenAITranscriptionResponse;
  modelId: string;
}

/**
 * Maps OpenAI transcription usage onto Pebble's token-based pricing line items.
 * Newer transcribe models (gpt-4o-transcribe family) bill in tokens; whisper-1
 * bills per second and emits no usage block, in which case no line items are recorded.
 */
export function buildOpenAITranscriptionPriceLineItems(
  input: OpenAITranscriptionPriceLineItemsInput,
): PricingLineItem[] {
  return staticPriceCalculator.lineItemsForUsage('openai', input.modelId, readOpenAITranscriptionUsage(input.data));
}

interface OpenAISpeechPriceLineItemsInput {
  modelId: string;
  characters: number;
}

/**
 * Speech endpoints don't return usage; pricing is per-character.
 * The static price table treats each character as one input token,
 * so the line item carries the character count for downstream rollups.
 */
export function buildOpenAISpeechPriceLineItems(input: OpenAISpeechPriceLineItemsInput): PricingLineItem[] {
  if (input.characters === 0) {
    return [];
  }
  return staticPriceCalculator.lineItemsForUsage('openai', input.modelId, {
    inputTokensReadUncached: input.characters,
  });
}

function readOpenAIUsage(data: OpenAIChatCompletionResponse): ModelUsage | undefined {
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

function readOpenAITranscriptionUsage(data: OpenAITranscriptionResponse): ModelUsage | undefined {
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
