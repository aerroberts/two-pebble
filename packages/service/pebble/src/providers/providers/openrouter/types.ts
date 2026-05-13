export interface OpenRouterProviderOptions {
  apiKey: string;
  model: string;
  baseUrl?: string;
  siteUrl?: string;
  appName?: string;
}

export interface OpenRouterProviderTextContentBlock {
  type: 'text';
  text: string;
}

export type OpenRouterInputAudioFormat = 'wav' | 'mp3';

export interface OpenRouterProviderInputAudioContentBlock {
  type: 'input_audio';
  input_audio: {
    data: string;
    format: OpenRouterInputAudioFormat;
  };
}

export type OpenRouterProviderContentBlock =
  | OpenRouterProviderTextContentBlock
  | OpenRouterProviderInputAudioContentBlock;

export interface OpenRouterProviderMessage {
  role: 'assistant' | 'system' | 'user' | 'tool';
  content: string | OpenRouterProviderContentBlock[] | null;
  tool_calls?: OpenRouterProviderRequestToolCall[];
  tool_call_id?: string;
}

export interface OpenRouterProviderRequestToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

export interface OpenRouterProviderRequest {
  model: string;
  messages: OpenRouterProviderMessage[];
  stop: string[];
  tools?: OpenRouterToolDefinition[];
}

export interface OpenRouterToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: object;
  };
}

export interface OpenRouterChatCompletionResponse {
  choices?: OpenRouterChoice[];
  usage?: OpenRouterUsage;
}

export interface OpenRouterChoice {
  message?: OpenRouterMessageResponse;
}

export interface OpenRouterMessageResponse {
  content?: string | null;
  tool_calls?: OpenRouterToolCall[];
}

export interface OpenRouterToolCall {
  id?: string;
  function?: OpenRouterToolFunction;
}

export interface OpenRouterToolFunction {
  name?: string;
  arguments?: string;
}

export interface OpenRouterUsage {
  prompt_tokens: number;
  completion_tokens: number;
  prompt_tokens_details?: {
    cached_tokens?: number;
  };
  completion_tokens_details?: {
    reasoning_tokens?: number;
  };
}

export type OpenRouterToolPayloadInput = string | undefined;

export interface OpenRouterTranscriptionProviderOptions {
  apiKey: string;
  model: string;
  baseUrl?: string;
  siteUrl?: string;
  appName?: string;
}

export interface OpenRouterTranscriptionRequest {
  model: string;
  input_audio: {
    data: string;
    format: string;
  };
  language?: string;
}

export interface OpenRouterTranscriptionResponse {
  text?: string;
  usage?: OpenRouterTranscriptionUsage;
}

export interface OpenRouterTranscriptionUsage {
  /** Duration of the transcribed audio in seconds. */
  seconds?: number;
  total_tokens?: number;
  input_tokens?: number;
  output_tokens?: number;
  /** Cost in USD reported by OpenRouter. */
  cost?: number;
}

export interface OpenRouterSpeechProviderOptions {
  apiKey: string;
  model: string;
  voice: string;
  format?: string;
  baseUrl?: string;
  siteUrl?: string;
  appName?: string;
}

export interface OpenRouterSpeechRequest {
  model: string;
  input: string;
  voice: string;
  response_format: string;
}
