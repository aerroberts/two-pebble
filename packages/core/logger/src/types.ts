export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LoggerContextValue =
  | LoggerContext
  | LoggerContextValue[]
  | Error
  | boolean
  | number
  | string
  | null
  | undefined;

export interface LoggerContext {
  [key: string]: LoggerContextValue;
}

export type LoggerScope = Record<string, string>;

export type LoggerScopeInput = Record<string, string | undefined>;

export type LoggerScopedCallback<TValue> = () => TValue;

export interface LoggerEntry {
  context: LoggerContext;
  level: LogLevel;
  message: string;
  timestamp: string;
}

export interface LoggerSink {
  push(entry: LoggerEntry): void;
}

export interface PrettyFormatInput {
  color: boolean;
}

export type PrettyFormatArray = LoggerContextValue[];

export type PrettyFormatObject = LoggerContext;

export type PrettyFormatSeenSet = WeakSet<object>;

export interface FileSyncSinkInput {
  filePath: string;
}

export interface JsonlFileSyncSinkInput {
  filePath: string;
}

export interface JsonlStdoutSinkInput {
  output: LoggerTextOutput;
}

export interface PrettySinkInput {
  output: LoggerTextOutput;
}

export interface StdoutSinkInput {
  output: LoggerTextOutput;
}

export interface LoggerTextOutput {
  write(chunk: string): void;
}
