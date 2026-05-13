import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Logger } from '../logger/logger';
import { FileSyncSink } from '../sinks/file-sync-sink';
import { JsonlFileSyncSink } from '../sinks/jsonl-file-sync-sink';
import type { LoggerContextValue, LoggerEntry } from '../types';

export function setupPrettyFileSyncLoggerTest() {
  const filePath = createFilePath('log');
  const logger = new Logger(new FileSyncSink({ filePath }));
  return createFileSyncLoggerTest(filePath, logger);
}

export function setupJsonlFileSyncLoggerTest() {
  const filePath = createFilePath('jsonl');
  const logger = new Logger(new JsonlFileSyncSink({ filePath }));
  return createFileSyncLoggerTest(filePath, logger);
}

function createFilePath(extension: string) {
  return path.join(os.tmpdir(), `two-pebble-logger-${crypto.randomUUID()}.${extension}`);
}

function createFileSyncLoggerTest(filePath: string, logger: Logger) {
  return {
    logger,
    readJsonlOutput() {
      return fs
        .readFileSync(filePath, 'utf8')
        .trim()
        .split('\n')
        .map(parseLogEntry)
        .map(normalizeLogEntry)
        .map((entry) => JSON.stringify(entry))
        .join('\n');
    },
    readPrettyOutput() {
      return fs
        .readFileSync(filePath, 'utf8')
        .trim()
        .split('\n')
        .map((line) => line.replace(/^\S+/, '<timestamp>'))
        .map((line) => line.replace(/stack: "[^"]*"/, 'stack: "<stack>"'))
        .join('\n');
    },
    readSnapshot(snapshotPath: string) {
      return fs.readFileSync(snapshotPath, 'utf8').trim();
    },
  };
}

function parseLogEntry(line: string) {
  return JSON.parse(line) as LoggerEntry;
}

function normalizeLogEntry(entry: LoggerEntry) {
  return {
    ...entry,
    context: {
      ...entry.context,
      error: normalizeError(entry.context.error),
    },
    timestamp: '<timestamp>',
  };
}

function normalizeError(error: LoggerContextValue) {
  if (typeof error !== 'object' || error === null || !('stack' in error)) {
    return error;
  }
  return { ...error, stack: '<stack>' };
}
