import type { LoggerEntry, LoggerSink, PrettySinkInput } from '../types';
import { formatPrettyEntry } from './format-pretty-entry';

/**
 * Writes logger entries as compact human-readable lines.
 *
 * Pretty output is the default runtime format because local development should
 * be scannable without expanding JSON.
 */
export class PrettySink implements LoggerSink {
  private readonly input: PrettySinkInput;

  /**
   * Creates a pretty sink.
   *
   * Runtime code should usually pass process stdout. Tests can pass an in-memory
   * text output and assert exact rendered lines.
   */
  public constructor(input: PrettySinkInput) {
    this.input = input;
  }

  /**
   * Writes one pretty log line.
   *
   * The rendered format is timestamp level message scope/context.
   */
  public push(entry: LoggerEntry): void {
    this.input.output.write(`${formatPrettyEntry(entry, { color: true })}\n`);
  }
}
