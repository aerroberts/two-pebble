import type { z } from 'zod/v4';
import type { CellContent } from '../../thread';
import type { ToolResponseResult } from '../hooks/tool-response';
import type { ToolInput } from './tool-input';

export type AgentToolType = 'cli' | 'framework' | 'native';

export type MaybePromise<T> = T | Promise<T>;

export type CliToolInvokeHandler<TInputSchema extends z.ZodType> = (
  input: z.infer<TInputSchema>,
) => MaybePromise<ToolResponseResult>;

export interface CliToolInput<TInputSchema extends z.ZodType, TOutputSchema extends z.ZodType> {
  description: string;
  name: string;
  outputSchema: TOutputSchema;
  schema: TInputSchema;
}

export type NativeToolInvokeHandler<TSchema extends z.ZodType> = (
  input: z.infer<TSchema>,
) => MaybePromise<ToolResponseResult>;

export interface NativeToolInput<TSchema extends z.ZodType> {
  description: string;
  name: string;
  schema: TSchema;
}

export type DataCellContent = Extract<CellContent, { type: 'data' }>;

export type ToolInvokeInput = ToolInput;
