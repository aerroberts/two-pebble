import type { CellContent, DataCells } from '../../../thread/cells/index';
import type { ConversationThread, ConversationTurn } from '../../../thread/index';
import { ModelProvider } from '../../model-provider';
import { collectNativeToolDefinitions } from '../../native-tools';
import type { ProviderOutputBlock, ProviderResult } from '../../types';
import { isRetryableProviderStatus } from '../../utils/retry';
import { buildOpenAIPriceLineItems } from './pricing';
import type {
  OpenAIChatCompletionResponse,
  OpenAIInputAudioFormat,
  OpenAIProviderContentBlock,
  OpenAIProviderMessage,
  OpenAIProviderOptions,
  OpenAIProviderRequest,
  OpenAIProviderRequestToolCall,
  OpenAIToolPayloadInput,
} from './types';

/**
 * OpenAI chat completions provider.
 * The provider owns credentials, request mapping, transport, and response mapping.
 * Pebble tool calls stay in the text stream through Pebble's custom parser.
 */
export class OpenAIProvider extends ModelProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly organization: string | undefined;
  public readonly modelId: string;
  public readonly providerId = 'openai';
  public override readonly supportsAudioMessages = true;

  public constructor(options: OpenAIProviderOptions) {
    super();
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? 'https://api.openai.com/v1';
    this.modelId = options.model;
    this.organization = options.organization;
  }

  /**
   * Invokes OpenAI directly.
   * Serialized Pebble turns are sent as chat messages.
   * Provider output is normalized into Pebble provider blocks.
   */
  protected override async invokeProvider(thread: ConversationThread, modelCallId: string) {
    const startedAt = Date.now();
    const threadCellPointer = thread.cursor;
    const request = this.buildRequest(thread);
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
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
        error: `OpenAI request failed with ${response.status}`,
        providerInput: request,
        providerOutput: { body: await response.text(), status: response.status },
        retryable: isRetryableProviderStatus(response.status),
        prices: [],
        threadCellPointer,
        output: [],
      };
      return result;
    }

    const data = (await response.json()) as OpenAIChatCompletionResponse;
    const result: ProviderResult = {
      id: modelCallId,
      completedAt: Date.now(),
      modelId: this.modelId,
      provider: this.providerId,
      startedAt,
      status: 'success',
      providerInput: request,
      providerOutput: data,
      prices: buildOpenAIPriceLineItems({ data, modelId: this.modelId }),
      threadCellPointer,
      output: this.parseResponse(data),
    };
    return result;
  }

  /**
   * Builds the OpenAI chat completion payload.
   * Tests inspect this without touching the network.
   * Cache turns are sent as user context because OpenAI has no Pebble cache role.
   */
  public buildRequest(thread: ConversationThread): OpenAIProviderRequest {
    const tools = collectNativeToolDefinitions(thread).map((tool) => ({
      type: 'function' as const,
      function: { name: tool.name, description: tool.description, parameters: tool.inputSchema },
    }));
    const request: OpenAIProviderRequest = {
      model: this.modelId,
      messages: thread.serialize().flatMap((turn) => this.buildMessages(turn)),
      stop: [ModelProvider.END_TURN_STOP_TOKEN],
    };
    if (tools.length > 0) request.tools = tools;
    return request;
  }

  private buildHeaders(): Headers {
    const headers = new Headers();
    headers.set('authorization', `Bearer ${this.apiKey}`);
    headers.set('content-type', 'application/json');

    if (this.organization != null) {
      headers.set('openai-organization', this.organization);
    }

    return headers;
  }

  private buildMessages(turn: ConversationTurn): OpenAIProviderMessage[] {
    const hasToolUse = turn.cells.some((cell) => cell.type === 'toolUse');
    const hasToolResult = turn.cells.some((cell) => cell.type === 'toolResult');

    if (turn.role === 'assistant' && hasToolUse) {
      return [this.buildAssistantWithToolCalls(turn)];
    }
    if (turn.role !== 'assistant' && hasToolResult) {
      return this.buildToolResultMessages(turn);
    }

    const role = turn.role === 'assistant' ? 'assistant' : 'user';
    if (!turn.cells.some((cell) => cell.type === 'audio')) {
      return [{ role, content: turn.raw }];
    }
    return [{ role, content: this.buildContentBlocks(turn.cells) }];
  }

  private buildAssistantWithToolCalls(turn: ConversationTurn): OpenAIProviderMessage {
    const toolCalls: OpenAIProviderRequestToolCall[] = [];
    let text = '';
    for (const cell of turn.cells) {
      if (cell.type === 'toolUse') {
        const input = cell.content.input;
        const inputObject =
          typeof input === 'object' && input !== null && !Array.isArray(input) ? input : { value: input };
        toolCalls.push({
          id: cell.content.callId,
          type: 'function',
          function: { name: cell.content.toolId, arguments: JSON.stringify(inputObject) },
        });
        continue;
      }
      const rendered = this.renderTextCell(cell);
      if (rendered.length === 0) continue;
      text = text.length === 0 ? rendered : `${text}\n\n${rendered}`;
    }
    const message: OpenAIProviderMessage = {
      role: 'assistant',
      content: text.length > 0 ? text : null,
      tool_calls: toolCalls,
    };
    return message;
  }

  private buildToolResultMessages(turn: ConversationTurn): OpenAIProviderMessage[] {
    const messages: OpenAIProviderMessage[] = [];
    let userTextBuffer = '';
    const flushUserText = () => {
      if (userTextBuffer.length === 0) return;
      messages.push({ role: 'user', content: userTextBuffer });
      userTextBuffer = '';
    };
    for (const cell of turn.cells) {
      if (cell.type === 'toolResult') {
        flushUserText();
        const text = (cell.content.content as { type: string; content: unknown }[])
          .map((inner) => this.renderTextCell(inner as CellContent))
          .filter((rendered) => rendered.length > 0)
          .join('\n\n');
        messages.push({
          role: 'tool',
          tool_call_id: cell.content.callId,
          content: text.length > 0 ? text : '(no output)',
        });
        continue;
      }
      const rendered = this.renderTextCell(cell);
      if (rendered.length === 0) continue;
      userTextBuffer = userTextBuffer.length === 0 ? rendered : `${userTextBuffer}\n\n${rendered}`;
    }
    flushUserText();
    return messages;
  }

  private buildContentBlocks(cells: DataCells): OpenAIProviderContentBlock[] {
    const blocks: OpenAIProviderContentBlock[] = [];
    let textBuffer = '';

    const flushText = () => {
      if (textBuffer.length === 0) {
        return;
      }
      blocks.push({ type: 'text', text: textBuffer });
      textBuffer = '';
    };

    for (const cell of cells) {
      if (cell.type === 'audio') {
        flushText();
        const format = this.audioFormatFor(cell.content.mimeType);
        if (format === undefined) {
          textBuffer += `[unsupported audio format: ${cell.content.mimeType}]`;
          continue;
        }
        blocks.push({
          type: 'input_audio',
          input_audio: { data: cell.content.base64Data, format },
        });
        continue;
      }

      const rendered = this.renderTextCell(cell);
      textBuffer = textBuffer.length === 0 ? rendered : `${textBuffer}\n\n${rendered}`;
    }

    flushText();
    return blocks;
  }

  private renderTextCell(cell: CellContent): string {
    switch (cell.type) {
      case 'audio':
        return '';
      case 'codeBlock':
        return `\`\`\`${cell.content.language}\n${cell.content.code}\n\`\`\``;
      case 'data':
        return `\`\`\`json\n${JSON.stringify(cell.content.value, null, 2)}\n\`\`\``;
      case 'header1':
        return `# ${cell.content.text}`;
      case 'header2':
        return `## ${cell.content.text}`;
      case 'image':
        return `[image](data:image/*;base64,${cell.content.base64Data})`;
      case 'text':
        return cell.content.text;
      case 'toolRegistration':
      case 'toolUse':
      case 'toolResult':
        // Structured tool turns are emitted via dedicated message kinds in
        // buildMessages; they never flow through the text-render path.
        return '';
    }
  }

  private audioFormatFor(mimeType: string): OpenAIInputAudioFormat | undefined {
    const normalized = mimeType.toLowerCase();
    if (normalized === 'audio/wav' || normalized === 'audio/x-wav' || normalized === 'audio/wave') {
      return 'wav';
    }
    if (normalized === 'audio/mp3' || normalized === 'audio/mpeg') {
      return 'mp3';
    }
    return undefined;
  }

  private parseResponse(data: OpenAIChatCompletionResponse): ProviderOutputBlock[] {
    const output: ProviderOutputBlock[] = [];

    for (const choice of data.choices ?? []) {
      const message = choice.message;
      if (message?.content != null && message.content.length > 0) {
        output.push({ type: 'text', text: message.content });
      }

      for (const toolCall of message?.tool_calls ?? []) {
        output.push({
          type: 'tool',
          callid: toolCall.id ?? crypto.randomUUID(),
          toolid: toolCall.function?.name ?? 'unknown',
          payload: this.parseToolPayload(toolCall.function?.arguments),
        });
      }
    }

    return output;
  }

  private parseToolPayload(input: OpenAIToolPayloadInput): object {
    if (input === undefined || input.length === 0) {
      return {};
    }

    try {
      const parsed = JSON.parse(input) as object | string | number | boolean | null;
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed;
      }

      return { value: parsed };
    } catch {
      return { value: input };
    }
  }
}
