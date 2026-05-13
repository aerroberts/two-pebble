import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { MissingLoggerScopeKeyError } from '../missing-logger-scope-key-error';
import {
  setupJsonlFileSyncLoggerTest,
  setupPrettyFileSyncLoggerTest,
} from '../testing/file-sync-logger-test-env.builder';
import { scope, scoped, scopeKey, scopeKeyRequired } from './scope';

describe('feature: logger async scope', () => {
  test('snapshot: jsonl file sync logs prove scope propagation', async () => {
    const ctx = setupJsonlFileSyncLoggerTest();
    await scoped({ requestId: 'req-1' }, async () => {
      ctx.logger.info('outer');
      await new Promise((resolve) => setTimeout(resolve, 1));
      await scoped({ requestId: 'req-2', traceId: 'trace-1' }, async () => ctx.logger.info('inner'));
      ctx.logger.info('outer restored');
    });
    expect(ctx.readJsonlOutput()).toBe(
      ctx.readSnapshot(resolve(import.meta.dirname, 'snapshots', 'scope-file-sync.jsonl')),
    );
  });

  test('snapshot: pretty file sync logs prove scope propagation', async () => {
    const ctx = setupPrettyFileSyncLoggerTest();
    await scoped({ requestId: 'req-1' }, async () => {
      ctx.logger.info('outer');
      await new Promise((resolve) => setTimeout(resolve, 1));
      await scoped({ requestId: 'req-2', traceId: 'trace-1' }, async () => ctx.logger.info('inner'));
      ctx.logger.info('outer restored');
    });
    expect(ctx.readPrettyOutput()).toBe(
      ctx.readSnapshot(resolve(import.meta.dirname, 'snapshots', 'scope-file-sync.log')),
    );
  });

  test('happy: exposes scope values while active', async () => {
    await scoped({ requestId: 'req-1' }, async () => {
      expect(scope().requestId).toBe('req-1');
      expect(scopeKey('requestId')).toBe('req-1');
    });
    expect(scope().requestId).toBeUndefined();
  });

  test('unhappy: required scope key throws when missing', () => {
    const readMissingKey = () => scopeKeyRequired('missing');
    expect(readMissingKey).toThrow(MissingLoggerScopeKeyError);
  });
});
