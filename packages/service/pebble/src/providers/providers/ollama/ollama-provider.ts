import type { ConversationThread, ConversationTurn } from '../../../thread/index';
import type { ToolInputRecord } from '../../../agent/tools/tool-input';
import { END_TURN_STOP_TOKEN } from '../../model-provider-constants';
import { ModelProvider } from '../../model-provider';
import { collectNativeToolDefinitions } from '../../native-tools';
import type { ProviderOutputBlock, ProviderResult } from '../../types';
import { isRetryableProviderStatus } from '../../utils/retry';
import { buildOllamaPriceLineItems } from './pricing';
import { renderTextCellOllama } from './render-text-cell';
import type {
  OllamaChatResponse,
  OllamaProviderMessage,
  OllamaProviderOptions,
  OllamaProviderRequest,
  OllamaProviderRequestToolCall,
} from './types';

/**
 * Ollama chat provider.
 * The provider owns local Ollama transport and request mapping.
 * Pebble tool calls stay in the text stream through Pebble's custom parser.
 */
export class OllamaProvider extends ModelProvider {
  private readonly baseUrl: string;
  public readonly modelId: string;
  public readonly providerId = 'ollama';

  public constructor(options: OllamaProviderOptions) {
    super();
    this.baseUrl = options.baseUrl ?? 'http://127.0.0.1:11434';
    this.modelId = options.model;
  }

  /**
   * Invokes Ollama directly.
   * Serialized Pebble turns are sent to the chat endpoint.
   * Provider output is normalized into Pebble provider blocks.
   */
  protected override async invokeProvider(thread: ConversationThread, modelCallId: string) {
    const startedAt = Date.now();
    const threadCellPointer = thread.cursor;
    const request = this.buildRequest(thread);
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const result: ProviderResult = {
        id: modelCallId,
        completedAt: Date.now(),
        modelId: this.modelId,
        provider: this.providerId,
        startedAt,
        status: 'error',
        error: `Ollama request failed with ${response.status}`,
        providerInput: request,
        providerOutput: { body: await response.text(), status: response.status },
        retryable: isRetryableProviderStatus(response.status),
        prices: [],
        threadCellPointer,
        output: [],
      };
      return result;
    }

    const data = (await response.json()) as OllamaChatResponse;
    const result: ProviderResult = {
      id: modelCallId,
      completedAt: Date.now(),
      modelId: this.modelId,
      provider: this.providerId,
      startedAt,
      status: 'success',
      providerInput: request,
      providerOutput: data,
      prices: buildOllamaPriceLineItems({ data, modelId: this.modelId }),
      threadCellPointer,
      output: this.parseResponse(data),
    };
    return result;
  }

  /**
   * Builds the Ollama chat payload.
   * Tests inspect this without touching a local Ollama process.
   * Cache turns are sent as user context because Ollama has no Pebble cache role.
   */
  public buildRequest(thread: ConversationThread): OllamaProviderRequest {
    const tools = collectNativeToolDefinitions(thread).map((tool) => ({
      type: 'function' as const,
      function: { name: tool.name, description: tool.description, parameters: tool.inputSchema },
    }));
    const request: OllamaProviderRequest = {
      messages: thread.serialize().flatMap((turn) => this.buildMessages(turn)),
      model: this.modelId,
      options: { stop: [END_TURN_STOP_TOKEN] },
      stream: false,
    };
    if (tools.length > 0) request.tools = tools;
    return request;
  }

  private buildHeaders(): Headers {
    const headers = new Headers();
    headers.set('content-type', 'application/json');
    return headers;
  }

  private buildMessages(turn: ConversationTurn): OllamaProviderMessage[] {
    const hasToolUse = turn.cells.some((cell) => cell.type === 'toolUse');
    const hasToolResult = turn.cells.some((cell) => cell.type === 'toolResult');

    if (turn.role === 'assistant' && hasToolUse) {
      const toolCalls: OllamaProviderRequestToolCall[] = [];
      let text = '';
      for (const cell of turn.cells) {
        if (cell.type === 'toolUse') {
          const input = cell.content.input;
          const inputObject =
            typeof input === 'object' && input !== null && !Array.isArray(input) ? input : { value: input };
          toolCalls.push({ function: { name: cell.content.toolId, arguments: inputObject } });
          continue;
        }
        const rendered = renderTextCellOllama(cell);
        if (rendered.length === 0) continue;
        text = text.length === 0 ? rendered : `${text}\n\n${rendered}`;
      }
      return [{ role: 'assistant', content: text, tool_calls: toolCalls }];
    }

    if (turn.role !== 'assistant' && hasToolResult) {
      const messages: OllamaProviderMessage[] = [];
      let userTextBuffer = '';
      const flushUserText = () => {
        if (userTextBuffer.length === 0) return;
        messages.push({ role: 'user', content: userTextBuffer });
        userTextBuffer = '';
      };
      for (const cell of turn.cells) {
        if (cell.type === 'toolResult') {
          flushUserText();
          const text = cell.content.content
            .map((inner) => renderTextCellOllama(inner))
            .filter((rendered) => rendered.length > 0)
            .join('\n\n');
          messages.push({
            role: 'tool',
            tool_call_id: cell.content.callId,
            content: text.length > 0 ? text : '(no output)',
          });
          continue;
        }
        const rendered = renderTextCellOllama(cell);
        if (rendered.length === 0) continue;
        userTextBuffer = userTextBuffer.length === 0 ? rendered : `${userTextBuffer}\n\n${rendered}`;
      }
      flushUserText();
      return messages;
    }

    const role = turn.role === 'assistant' ? 'assistant' : 'user';
    return [{ role, content: turn.raw }];
  }

  private parseResponse(data: OllamaChatResponse): ProviderOutputBlock[] {
    const output: ProviderOutputBlock[] = [];
    const content = data.message?.content ?? '';
    if (content.length > 0) {
      output.push({ type: 'text', text: content });
    }
    for (const toolCall of data.message?.tool_calls ?? []) {
      output.push({
        type: 'tool',
        callid: crypto.randomUUID(),
        toolid: toolCall.function?.name ?? 'unknown',
        payload: toolCall.function?.arguments ?? ({} as ToolInputRecord),
      });
    }
    return output;
  }
}
