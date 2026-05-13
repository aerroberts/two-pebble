import { describe, test } from 'bun:test';
import {
  buildSignalTestRuntime,
  expectSignalRuntimeConsumed,
  parkOnSignal,
  resumeFromSignal,
} from './pebble-agent-signals.test-helpers';

describe('feature: pebble agent durable signals', () => {
  test('happy: open awaited signal parks the agent, received signal resumes through capability hook', async () => {
    const runtime = buildSignalTestRuntime();
    await parkOnSignal(runtime);
    await resumeFromSignal(runtime);
    expectSignalRuntimeConsumed(runtime);
  });
});
