import type { DataCells } from '../../thread';

export type ToolResponseResult =
  | { status: 'success'; content: DataCells }
  | { status: 'error'; error: string; content: DataCells };

/**
 * Represents a tool response to the model, either success or error.
 */
export const ToolResponse = {
  success(content: DataCells): ToolResponseResult {
    return {
      status: 'success',
      content,
    };
  },
  error(error: string, content: DataCells): ToolResponseResult {
    return {
      status: 'error',
      error,
      content,
    };
  },
};
