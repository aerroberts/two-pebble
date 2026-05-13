export type ToolInput = ToolInputRecord | ToolInputList | string | number | boolean | null;

export type MaybeToolInput = ToolInput | undefined;

export type MaybeToolInputRecord = ToolInputRecord | null;

export interface ToolInputRecord {
  [key: string]: ToolInput;
}

export type ToolInputList = ToolInput[];
