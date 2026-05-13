import type { LoggerEntry, LoggerSink, StdoutSinkInput } from '../types';
import { formatPrettyEntry } from './format-pretty-entry';

/**
 * Writes logger entries as pretty lines.
 *
 * This class is the default stdout sink. It keeps local development output easy
 * to scan while JSONL remains available through JsonlStdoutSink.
 */
export class StdoutSink implements LoggerSink {
  private readonly input: StdoutSinkInput;

  /**
   * Creates a stdout sink.
   *
   * A custom output can be passed in tests. Production usage defaults to the
   * process stdout stream.
   */
  public constructor(input: StdoutSinkInput) {
    this.input = input;
  }

  /**
   * Writes one log entry.
   *
   * The rendered format is timestamp level message scope/context.
   */
  public push(entry: LoggerEntry): void {
    this.input.output.write(`${formatPrettyEntry(entry, { color: true })}\n`);
  }
}
