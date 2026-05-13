import { describe, test } from 'bun:test';
import {
  buildSignalTestRuntime,
  expectSignalRuntimeConsumed,
  resumeFromSignal,
  waitOnSignal,
} from './pebble-agent-signals.test-helpers';

describe('feature: pebble agent durable signals', () => {
  test('happy: open awaited signal moves the agent into waiting, received signal resumes through capability hook', async () => {
    const runtime = buildSignalTestRuntime();
    await waitOnSignal(runtime);
    await resumeFromSignal(runtime);
    expectSignalRuntimeConsumed(runtime);
  });
});
