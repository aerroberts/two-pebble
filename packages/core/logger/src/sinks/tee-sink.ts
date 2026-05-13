import type { LoggerEntry, LoggerSink } from '../types';

/**
 * Fans out each logger entry to every wrapped sink in order.
 *
 * Useful when one logger needs to write to several destinations at once,
 * e.g. a daemon that should both tail to stdout and persist to a file.
 */
export class TeeSink implements LoggerSink {
  private readonly sinks: LoggerSink[];

  /**
   * Creates a tee sink that delegates to the provided sinks.
   *
   * The order is preserved on every push so deterministic test sinks remain
   * deterministic when paired with stdout sinks.
   */
  public constructor(sinks: LoggerSink[]) {
    this.sinks = sinks;
  }

  /**
   * Pushes the entry to each wrapped sink.
   *
   * A throwing sink does not stop downstream sinks; errors propagate so the
   * caller can decide whether to swallow them.
   */
  public push(entry: LoggerEntry): void {
    for (const sink of this.sinks) {
      sink.push(entry);
    }
  }
}
