import type { ToolInput } from '../../../agent/tools/tool-input';

export interface AnthropicProviderOptions {
  apiKey: string;
  model: string;
  baseUrl?: string;
  maxTokens?: number;
}

export interface AnthropicProviderMessage {
  role: 'assistant' | 'user';
  content: string | AnthropicProviderContentBlock[];
}

export type AnthropicProviderContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: unknown }
  | { type: 'tool_result'; tool_use_id: string; content: string; is_error?: boolean };

export interface AnthropicProviderRequest {
  max_tokens: number;
  messages: AnthropicProviderMessage[];
  model: string;
  stop_sequences: string[];
  system?: string;
  tools?: AnthropicToolDefinition[];
}

export interface AnthropicToolDefinition {
  name: string;
  description: string;
  input_schema: object;
}

export interface AnthropicMessageResponse {
  content?: AnthropicContentBlock[];
  usage?: AnthropicUsage;
}

export interface AnthropicContentBlock {
  type?: string;
  text?: string;
  thinking?: string;
  name?: string;
  input?: ToolInput;
}

export interface AnthropicUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

export type AnthropicToolPayloadInput = ToolInput | undefined;
