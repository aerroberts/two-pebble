import { z } from 'zod/v4';
import { Cell, type CellContent, type DataCells } from '../../thread';
import { ToolResponse, type ToolResponseResult } from '../hooks/tool-response';
import { AgentTool } from './agent-tool';
import { coerceToSchema } from './coerce-to-schema';
import type { ToolInput } from './tool-input';
import type { NativeToolInput, NativeToolInvokeHandler } from './types';

/**
 * Provider-native tool whose definition is sent through the model API's
 * tools channel rather than embedded as XML in the prompt. Registration
 * publishes a structured tool-registration cell that providers scan to
 * build the API-shaped tools payload; the model's tool calls come back
 * through the provider's native tool_use channel and are dispatched here.
 */
export class NativeTool<TSchema extends z.ZodType> extends AgentTool {
  public readonly description: string;
  public readonly id: string;
  public readonly input: TSchema;
  public readonly type = 'native';
  private invokeHandler: NativeToolInvokeHandler<TSchema> | null = null;

  /**
   * Creates one native tool. The schema is converted to JSON Schema at
   * describe-time so providers can attach it to their request payload.
   */
  public constructor(input: NativeToolInput<TSchema>) {
    super();

    this.description = input.description;
    this.id = input.name;
    this.input = input.schema;
  }

  /**
   * Registers the implementation called after schema validation succeeds.
   * The handler receives the inferred Zod input type rather than raw parser data.
   */
  public onInvoke(handler: NativeToolInvokeHandler<TSchema>) {
    this.invokeHandler = handler;
    return this;
  }

  /**
   * Returns a structural tool-registration cell carrying the JSON Schema
   * for the input. The model never sees this cell as text — providers
   * pluck the metadata from thread.cells and forward the tool through
   * their native tool API.
   */
  public describe(): DataCells {
    return [
      Cell.toolRegistration({
        name: this.id,
        description: this.description,
        toolType: this.type,
        inputSchema: z.toJSONSchema(this.input) as object,
      }),
    ];
  }

  /**
   * Validates the model-supplied tool input against the Zod schema and
   * dispatches to the registered handler. Validation failures are
   * surfaced as normal tool errors so the model can correct itself.
   */
  public invoke(input: ToolInput): ToolResponseResult | Promise<ToolResponseResult> {
    const coerced = coerceToSchema(this.input, input);
    const result = this.input.safeParse(coerced);

    if (!result.success) {
      const error = `Invalid input for tool ${this.id}: ${result.error.message}`;
      return ToolResponse.error(error, [Cell.text(error)]);
    }

    if (this.invokeHandler === null) {
      const error = `No invoke handler registered for tool ${this.id}.`;
      return ToolResponse.error(error, [Cell.text(error)]);
    }

    return this.invokeHandler(result.data);
  }
}
