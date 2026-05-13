import fs from 'node:fs';
import path from 'node:path';
import type { JsonlFileSyncSinkInput, LoggerEntry, LoggerSink } from '../types';
import { formatJsonlEntry } from './format-jsonl-entry';

/**
 * Writes logger entries to a file synchronously as JSON lines.
 *
 * JSONL is intended for structured processing where each entry needs to remain
 * machine-readable without parsing human-oriented text.
 */
export class JsonlFileSyncSink implements LoggerSink {
  private readonly input: JsonlFileSyncSinkInput;

  /**
   * Creates the sink and ensures the parent directory exists.
   *
   * Existing files are appended to so long-running local daemons keep a
   * continuous log history across restarts.
   */
  public constructor(input: JsonlFileSyncSinkInput) {
    this.input = input;
    fs.mkdirSync(path.dirname(input.filePath), { recursive: true });
  }

  /**
   * Appends one JSONL log entry to disk synchronously.
   *
   * Synchronous writes make immediate read-after-write tests deterministic and
   * keep crash-sensitive log lines durable before the caller continues. A
   * missing parent directory (e.g. removed by test teardown) is silently
   * ignored so a trailing log write cannot crash the process.
   */
  public push(entry: LoggerEntry): void {
    try {
      fs.appendFileSync(this.input.filePath, `${formatJsonlEntry(entry)}\n`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
