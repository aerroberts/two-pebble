import type { DataCells } from '../../thread/index';
import type { PebbleToolCall } from '../types';

export interface ToolResultThreadEventInput {
  content: DataCells;
  duration: number;
  error: string | null;
  input: PebbleToolCall;
  success: boolean;
}
