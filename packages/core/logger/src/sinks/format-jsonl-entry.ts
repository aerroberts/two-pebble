import type { LoggerContextValue, LoggerEntry } from '../types';

export function formatJsonlEntry(entry: LoggerEntry): string {
  return JSON.stringify(entry, safeReplacer());
}

function safeReplacer() {
  const seen = new WeakSet<object>();
  return (_key: string, value: LoggerContextValue) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  };
}
