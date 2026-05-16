import { AsyncLocalStorage } from 'node:async_hooks';
import { MissingLoggerScopeKeyError } from '../missing-logger-scope-key-error';
import type { LoggerScope, LoggerScopedCallback, LoggerScopeInput } from '../types';

const storage = new AsyncLocalStorage<LoggerScope>();

/**
 * Runs a callback with logger scope additions applied.
 *
 * The new values are merged with any active async scope, and undefined values
 * are removed so callers can intentionally clear inherited scope keys.
 */
export function scoped<TValue>(additions: LoggerScopeInput, callback: LoggerScopedCallback<TValue>): TValue {
  const current = storage.getStore();
  const merged = { ...current, ...additions };
  const clean = Object.fromEntries(Object.entries(merged).filter((entry) => entry[1] !== undefined));
  return storage.run(clean as LoggerScope, callback);
}

/**
 * Returns the active logger scope for the current async execution.
 *
 * Callers receive an empty object when no scope has been established, keeping
 * logger context merging simple for code outside scoped operations.
 */
export function scope(): LoggerScope {
  return storage.getStore() ?? {};
}

/**
 * Reads one optional value from the active logger scope.
 *
 * Missing keys return undefined so call sites can decide whether the value is
 * required for their logging or telemetry path.
 */
export function scopeKey(key: string): string | undefined {
  return scope()[key];
}

/**
 * Reads one required value from the active logger scope.
 *
 * Missing keys throw a typed error so integration boundaries fail clearly when
 * required correlation data was not installed.
 */
export function scopeKeyRequired(key: string): string {
  const value = scope()[key];
  if (value === undefined) {
    throw new MissingLoggerScopeKeyError(key);
  }
  return value;
}
