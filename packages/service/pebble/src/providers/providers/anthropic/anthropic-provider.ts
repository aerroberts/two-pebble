import type { ConversationThread, ConversationTurn } from '../../../thread/index';
import type { ToolInputRecord } from '../../../agent/tools/tool-input';
import { END_TURN_STOP_TOKEN } from '../../model-provider-constants';
import { ModelProvider } from '../../model-provider';
import { collectNativeToolDefinitions } from '../../native-tools';
import type { ProviderOutputBlock, ProviderResult } from '../../types';
import { isRetryableProviderStatus } from '../../utils/retry';
import { buildAnthropicPriceLineItems } from './pricing';
import { renderTextCellAnthropic } from './render-text-cell';
import type {
  AnthropicContentBlock,
  AnthropicMessageResponse,
  AnthropicProviderContentBlock,
  AnthropicProviderMessage,
  AnthropicProviderOptions,
  AnthropicProviderRequest,
  AnthropicToolPayloadInput,
} from './types';

/**
 * Anthropic Messages provider.
 * The provider owns credentials, request mapping, transport, and response mapping.
 * Pebble tool calls stay in the text stream through Pebble's custom parser.
 */
export class AnthropicProvider extends ModelProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly maxTokens: number;
  public readonly modelId: string;
  public readonly providerId = 'anthropic';

  public constructor(options: AnthropicProviderOptions) {
    super();
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? 'https://api.anthropic.com/v1';
    this.maxTokens = options.maxTokens ?? 4096;
    this.modelId = options.model;
  }

  /**
   * Invokes Anthropic directly.
   * Serialized Pebble turns are mapped into Anthropic messages.
   * Provider output is normalized into Pebble provider blocks.
   */
  protected override async invokeProvider(thread: ConversationThread, modelCallId: string) {
    const startedAt = Date.now();
    const threadCellPointer = thread.cursor;
    const request = this.buildRequest(thread);
    const response = await fetch(`${this.baseUrl}/messages`, {
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
        error: `Anthropic request failed with ${response.status}`,
        providerInput: request,
        providerOutput: { body: await response.text(), status: response.status },
        retryable: isRetryableProviderStatus(response.status),
        prices: [],
        threadCellPointer,
        output: [],
      };
      return result;
    }

    const data = (await response.json()) as AnthropicMessageResponse;
    const result: ProviderResult = {
      id: modelCallId,
      completedAt: Date.now(),
      modelId: this.modelId,
      provider: this.providerId,
      startedAt,
      status: 'success',
      providerInput: request,
      providerOutput: data,
      prices: buildAnthropicPriceLineItems({ data, modelId: this.modelId }),
      threadCellPointer,
      output: this.parseResponse(data),
    };
    return result;
  }

  /**
   * Builds the Anthropic Messages payload.
   * System turns are lifted into Anthropic's top-level system prompt.
   * Cache turns are sent as user context because Anthropic has no Pebble cache role.
   */
  public buildRequest(thread: ConversationThread): AnthropicProviderRequest {
    const turns = thread.serialize();
    const tools = collectNativeToolDefinitions(thread).map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema,
    }));
    const request: AnthropicProviderRequest = {
      max_tokens: this.maxTokens,
      messages: turns.map((turn) => this.buildMessage(turn)),
      model: this.modelId,
      stop_sequences: [END_TURN_STOP_TOKEN],
    };
    if (tools.length > 0) request.tools = tools;
    return request;
  }

  private buildHeaders(): Headers {
    const headers = new Headers();
    headers.set('anthropic-version', '2023-06-01');
    headers.set('content-type', 'application/json');
    headers.set('x-api-key', this.apiKey);
    return headers;
  }

  private buildMessage(turn: ConversationTurn): AnthropicProviderMessage {
    const role = turn.role === 'assistant' ? 'assistant' : 'user';
    const hasStructuralToolCell = turn.cells.some((cell) => cell.type === 'toolUse' || cell.type === 'toolResult');
    if (!hasStructuralToolCell) return { role, content: turn.raw };

    const blocks: AnthropicProviderContentBlock[] = [];
    let textBuffer = '';
    const flushText = () => {
      if (textBuffer.length === 0) return;
      blocks.push({ type: 'text', text: textBuffer });
      textBuffer = '';
    };
    for (const cell of turn.cells) {
      if (cell.type === 'toolUse') {
        flushText();
        const input = cell.content.input;
        const inputObject =
          typeof input === 'object' && input !== null && !Array.isArray(input) ? input : { value: input };
        blocks.push({ type: 'tool_use', id: cell.content.callId, name: cell.content.toolId, input: inputObject });
        continue;
      }
      if (cell.type === 'toolResult') {
        flushText();
        const text = cell.content.content
          .map((inner) => renderTextCellAnthropic(inner))
          .filter((rendered) => rendered.length > 0)
          .join('\n\n');
        const block: AnthropicProviderContentBlock = {
          type: 'tool_result',
          tool_use_id: cell.content.callId,
          content: text.length > 0 ? text : '(no output)',
        };
        if (!cell.content.success) block.is_error = true;
        blocks.push(block);
        continue;
      }
      const rendered = renderTextCellAnthropic(cell);
      if (rendered.length === 0) continue;
      textBuffer = textBuffer.length === 0 ? rendered : `${textBuffer}\n\n${rendered}`;
    }
    flushText();
    return { role, content: blocks };
  }

  private parseResponse(data: AnthropicMessageResponse): ProviderOutputBlock[] {
    const output: ProviderOutputBlock[] = [];

    for (const block of data.content ?? []) {
      output.push(this.parseBlock(block));
    }

    return output;
  }

  private parseBlock(block: AnthropicContentBlock): ProviderOutputBlock {
    if (block.type === 'text') {
      return { type: 'text', text: block.text ?? '' };
    }

    if (block.type === 'thinking') {
      return { type: 'thinking', text: block.thinking ?? '' };
    }

    if (block.type === 'tool_use') {
      return {
        type: 'tool',
        callid: crypto.randomUUID(),
        toolid: block.name ?? 'unknown',
        payload: this.toobject(block.input),
      };
    }

    return { type: 'text', text: JSON.stringify(block) };
  }

  private toobject(input: AnthropicToolPayloadInput): ToolInputRecord {
    if (typeof input === 'object' && input !== null && !Array.isArray(input)) {
      return input;
    }

    return { value: input ?? null };
  }
}
