import { AsyncLocalStorage } from 'node:async_hooks';
import { MissingLoggerScopeKeyError } from '../missing-logger-scope-key-error';
import type { LoggerScope, LoggerScopedCallback, LoggerScopeInput } from '../types';

const storage = new AsyncLocalStorage<LoggerScope>();

export function scoped<TValue>(additions: LoggerScopeInput, callback: LoggerScopedCallback<TValue>): TValue {
  const current = storage.getStore();
  const merged = { ...current, ...additions };
  const clean = Object.fromEntries(Object.entries(merged).filter((entry) => entry[1] !== undefined));
  return storage.run(clean as LoggerScope, callback);
}

export function scope(): LoggerScope {
  return storage.getStore() ?? {};
}

export function scopeKey(key: string): string | undefined {
  return scope()[key];
}

export function scopeKeyRequired(key: string): string {
  const value = scope()[key];
  if (value === undefined) {
    throw new MissingLoggerScopeKeyError(key);
  }
  return value;
}
