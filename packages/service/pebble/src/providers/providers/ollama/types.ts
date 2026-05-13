import type { ToolInputRecord } from '../../../agent/tools/tool-input';

export interface OllamaProviderOptions {
  model: string;
  baseUrl?: string;
}

export interface OllamaProviderMessage {
  role: 'assistant' | 'system' | 'user' | 'tool';
  content: string;
  tool_calls?: OllamaProviderRequestToolCall[];
  tool_call_id?: string;
}

export interface OllamaProviderRequestToolCall {
  function: { name: string; arguments: ToolInputRecord };
}

export interface OllamaProviderRequest {
  model: string;
  messages: OllamaProviderMessage[];
  options: {
    stop: string[];
  };
  stream: false;
  tools?: OllamaToolDefinition[];
}

export interface OllamaToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: object;
  };
}

export interface OllamaChatResponse {
  message?: OllamaMessageResponse;
  prompt_eval_count?: number;
  eval_count?: number;
}

export interface OllamaMessageResponse {
  content?: string | null;
  tool_calls?: OllamaToolCall[];
}

export interface OllamaToolCall {
  function?: OllamaToolFunction;
}

export interface OllamaToolFunction {
  name?: string;
  arguments?: ToolInputRecord;
}
