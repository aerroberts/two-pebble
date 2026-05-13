import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { scoped } from '../scope/scope';
import {
  setupJsonlFileSyncLoggerTest,
  setupPrettyFileSyncLoggerTest,
} from '../testing/file-sync-logger-test-env.builder';

describe('feature: logger entries', () => {
  test('snapshot: writes jsonl entries to sync file sink', () => {
    const ctx = setupJsonlFileSyncLoggerTest();
    ctx.logger.info('hello', { requestId: 'req-1' });
    void scoped({ traceId: 'trace-1' }, () => ctx.logger.warn('inside', { attempt: 2 }));
    ctx.logger.error('failed', { error: new Error('boom') });
    expect(ctx.readJsonlOutput()).toBe(
      ctx.readSnapshot(resolve(import.meta.dirname, 'snapshots', 'logger-file-sync.jsonl')),
    );
  });

  test('snapshot: writes pretty entries to sync file sink', () => {
    const ctx = setupPrettyFileSyncLoggerTest();
    ctx.logger.info('hello', { requestId: 'req-1' });
    void scoped({ traceId: 'trace-1' }, () => ctx.logger.warn('inside', { attempt: 2 }));
    ctx.logger.error('failed', { error: new Error('boom') });
    expect(ctx.readPrettyOutput()).toBe(
      ctx.readSnapshot(resolve(import.meta.dirname, 'snapshots', 'logger-file-sync.log')),
    );
  });
});
