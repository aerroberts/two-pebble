import type {
  LoggerContextValue,
  LoggerEntry,
  LogLevel,
  PrettyFormatArray,
  PrettyFormatInput,
  PrettyFormatObject,
  PrettyFormatSeenSet,
} from '../types';

const reset = '\u001b[0m';
const gray = '\u001b[90m';
const white = '\u001b[97m';
const cyan = '\u001b[36m';
const green = '\u001b[32m';
const yellow = '\u001b[33m';
const red = '\u001b[31m';

/**
 * Formats one logger entry for human-readable terminal output.
 *
 * The formatter keeps the same field order as structured logs while applying
 * optional ANSI colors and compact context rendering for local diagnostics.
 */
export function formatPrettyEntry(entry: LoggerEntry, input: PrettyFormatInput): string {
  const app = colorize('two-pebble', gray, input);
  const timestamp = colorize(entry.timestamp, gray, input);
  const level = colorize(entry.level, levelColor(entry.level), input);
  const message = colorize(entry.message, white, input);
  const context = colorize(formatContext(entry.context), gray, input);
  return `${app} ${timestamp} ${level} ${message} ${context}`;
}

function formatContext(context: PrettyFormatObject) {
  if (Object.keys(context).length === 0) {
    return '{}';
  }

  const seen = new WeakSet<object>();
  return formatObject(context, seen);
}

function formatObject(value: PrettyFormatObject, seen: PrettyFormatSeenSet) {
  if (seen.has(value)) {
    return '"[Circular]"';
  }

  seen.add(value);
  const pairs = Object.entries(value).map(([key, item]) => `${key}: ${formatValue(item, seen)}`);
  return `{ ${pairs.join(', ')} }`;
}

function formatArray(value: PrettyFormatArray, seen: PrettyFormatSeenSet) {
  if (seen.has(value)) {
    return '"[Circular]"';
  }

  seen.add(value);
  return `[${value.map((item) => formatValue(item, seen)).join(', ')}]`;
}

function formatValue(value: LoggerContextValue, seen: PrettyFormatSeenSet): string {
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
    return String(value);
  }

  if (typeof value === 'undefined') {
    return 'undefined';
  }

  if (Array.isArray(value)) {
    return formatArray(value, seen);
  }

  if (typeof value === 'object') {
    return formatObject(value as PrettyFormatObject, seen);
  }

  return JSON.stringify(String(value));
}

function colorize(value: string, color: string, input: PrettyFormatInput) {
  if (!input.color) {
    return value;
  }

  return `${color}${value}${reset}`;
}

function levelColor(level: LogLevel) {
  if (level === 'debug') {
    return cyan;
  }

  if (level === 'info') {
    return green;
  }

  if (level === 'warn') {
    return yellow;
  }

  return red;
}
