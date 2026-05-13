import fs from 'node:fs';
import path from 'node:path';
import type { FileSyncSinkInput, LoggerEntry, LoggerSink } from '../types';
import { formatPrettyEntry } from './format-pretty-entry';

/**
 * Writes pretty logger entries to a file synchronously.
 *
 * This sink is intentionally blocking. Use it for local daemons, tests, and
 * crash-sensitive paths where the log line must be on disk before continuing.
 */
export class FileSyncSink implements LoggerSink {
  private readonly input: FileSyncSinkInput;

  /**
   * Creates the sink and ensures the parent directory exists.
   *
   * The file itself is append-only. Existing log files are preserved so process
   * restarts keep a continuous local history.
   */
  public constructor(input: FileSyncSinkInput) {
    this.input = input;
    fs.mkdirSync(path.dirname(input.filePath), { recursive: true });
  }

  /**
   * Appends one pretty log entry to disk.
   *
   * Synchronous append keeps ordering simple and makes this sink safe for tests
   * that read the file immediately after a logger call returns. A missing
   * parent directory (e.g. removed by test teardown) is silently ignored so a
   * trailing log write cannot crash the process.
   */
  public push(entry: LoggerEntry): void {
    try {
      fs.appendFileSync(this.input.filePath, `${formatPrettyEntry(entry, { color: false })}\n`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
