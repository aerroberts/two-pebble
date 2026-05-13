/// <reference path="../../text-imports.d.ts" />

import type { z } from 'zod/v4';
import { DataSerializer } from '../../serializer';
import { Cell, type DataCells } from '../../thread';
import { ToolResponse, type ToolResponseResult } from '../hooks/tool-response';
import { AgentTool } from './agent-tool';
import cliToolRegistrationText from './cli-tool-registration.md?raw';
import type { ToolInput } from './tool-input';
import type { CliToolInput, CliToolInvokeHandler } from './types';

/**
 * Provides a daemon-facing tool that external clients can invoke over the
 * Pebble bridge. CLI tools are described in model context for discovery, but
 * execution requires an external process to run `peb call-tool`.
 */
export class CliTool<TInputSchema extends z.ZodType, TOutputSchema extends z.ZodType> extends AgentTool {
  public readonly description: string;
  public readonly id: string;
  public readonly input: TInputSchema;
  public readonly output: TOutputSchema;
  public readonly type = 'cli';
  private readonly serializer = new DataSerializer();
  private invokeHandler: CliToolInvokeHandler<TInputSchema> | null = null;

  /**
   * Creates one externally-invoked CLI tool.
   * The input schema validates daemon calls.
   * The output schema validates the returned data cell.
   */
  public constructor(input: CliToolInput<TInputSchema, TOutputSchema>) {
    super();

    this.description = input.description;
    this.id = input.name;
    this.input = input.schema;
    this.output = input.outputSchema;
  }

  /**
   * Registers the handler called after schema validation.
   * The handler receives the inferred Zod input type.
   * The tool is returned so setup code can chain registration.
   */
  public onInvoke(handler: CliToolInvokeHandler<TInputSchema>) {
    this.invokeHandler = handler;
    return this;
  }

  /**
   * Describes the CLI tool protocol for the model.
   * Input and output examples come from the serializer.
   * The agent id is included so external commands can target the run.
   */
  public describe(): DataCells {
    return [
      Cell.text(
        cliToolRegistrationText
          .replaceAll('{{toolName}}', this.id)
          .replaceAll('{{toolDescription}}', this.description)
          .replaceAll('{{toolInput}}', this.serializer.toJson(this.input))
          .replaceAll('{{toolOutput}}', this.serializer.toJson(this.output))
          .replaceAll('{{agentId}}', this.agent.agentId),
      ),
    ];
  }

  /**
   * Validates input and dispatches to the CLI handler.
   * Successful responses must contain one schema-valid data cell.
   * Validation failures are returned as normal tool errors.
   */
  public invoke(input: ToolInput): ToolResponseResult | Promise<ToolResponseResult> {
    const result = this.input.safeParse(input);

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
