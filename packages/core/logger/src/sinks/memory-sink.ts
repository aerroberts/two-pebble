import type { LoggerEntry, LoggerSink } from '../types';

/**
 * Captures log entries in memory.
 *
 * This sink is intended for tests and local assertions. It stores cloned entry
 * references in insertion order and never writes to process output.
 */
export class MemorySink implements LoggerSink {
  private readonly capturedEntries: LoggerEntry[] = [];

  /**
   * Returns all captured entries.
   *
   * A shallow copy is returned so callers can inspect logs without mutating the
   * sink's internal collection.
   */
  public get entries(): LoggerEntry[] {
    return [...this.capturedEntries];
  }

  /**
   * Stores one log entry.
   *
   * Entries are appended in the same order the logger produced them, making the
   * sink useful for snapshot and assertion based tests.
   */
  public push(entry: LoggerEntry): void {
    this.capturedEntries.push(entry);
  }
}
