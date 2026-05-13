import type { JsonlStdoutSinkInput, LoggerEntry, LoggerSink } from '../types';
import { formatJsonlEntry } from './format-jsonl-entry';

/**
 * Writes logger entries as JSON lines to a text output.
 *
 * Use this sink when process output is consumed by log aggregation or command
 * line tools that expect one JSON object per line.
 */
export class JsonlStdoutSink implements LoggerSink {
  private readonly input: JsonlStdoutSinkInput;

  /**
   * Creates a JSONL stdout sink.
   *
   * A custom output can be passed in tests while runtime callers normally pass
   * process stdout.
   */
  public constructor(input: JsonlStdoutSinkInput) {
    this.input = input;
  }

  /**
   * Writes one structured log entry.
   *
   * The entry is serialized with circular-reference protection before a newline
   * is appended.
   */
  public push(entry: LoggerEntry): void {
    this.input.output.write(`${formatJsonlEntry(entry)}\n`);
  }
}
