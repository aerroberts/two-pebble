export interface OpenAIProviderOptions {
  apiKey: string;
  model: string;
  baseUrl?: string;
  organization?: string;
}

export interface OpenAIProviderTextContentBlock {
  type: 'text';
  text: string;
}

export type OpenAIInputAudioFormat = 'wav' | 'mp3';

export interface OpenAIProviderInputAudioContentBlock {
  type: 'input_audio';
  input_audio: {
    data: string;
    format: OpenAIInputAudioFormat;
  };
}

export type OpenAIProviderContentBlock = OpenAIProviderTextContentBlock | OpenAIProviderInputAudioContentBlock;

export interface OpenAIProviderMessage {
  role: 'assistant' | 'system' | 'user' | 'tool';
  content: string | OpenAIProviderContentBlock[] | null;
  tool_calls?: OpenAIProviderRequestToolCall[];
  tool_call_id?: string;
}

export interface OpenAIProviderRequestToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

export interface OpenAIProviderRequest {
  model: string;
  messages: OpenAIProviderMessage[];
  stop: string[];
  tools?: OpenAIToolDefinition[];
}

export interface OpenAIToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: object;
  };
}

export interface OpenAIChatCompletionResponse {
  choices?: OpenAIChoice[];
  usage?: OpenAIUsage;
}

export interface OpenAIChoice {
  message?: OpenAIMessageResponse;
}

export interface OpenAIMessageResponse {
  content?: string | null;
  tool_calls?: OpenAIToolCall[];
}

export interface OpenAIToolCall {
  id?: string;
  function?: OpenAIToolFunction;
}

export interface OpenAIToolFunction {
  name?: string;
  arguments?: string;
}

export interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  prompt_tokens_details?: {
    cached_tokens?: number;
  };
  completion_tokens_details?: {
    reasoning_tokens?: number;
  };
}

export type OpenAIToolPayloadInput = string | undefined;

export interface OpenAITranscriptionProviderOptions {
  apiKey: string;
  model: string;
  baseUrl?: string;
  organization?: string;
}

export interface OpenAITranscriptionResponse {
  text?: string;
  language?: string;
  /** Duration of the source audio in seconds. */
  duration?: number;
  usage?: OpenAITranscriptionUsage;
}

export interface OpenAITranscriptionUsage {
  /** Total billed seconds for the transcription. */
  seconds?: number;
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
}

export interface OpenAISpeechProviderOptions {
  apiKey: string;
  model: string;
  voice: string;
  format?: string;
  baseUrl?: string;
  organization?: string;
}

export interface OpenAISpeechRequest {
  model: string;
  input: string;
  voice: string;
  response_format: string;
}
